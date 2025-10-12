import { HfInference } from '@huggingface/inference';
import type { RuntimeConfig } from 'nuxt/schema';
import prisma from '~/lib/prisma';
import { updateUserReputation } from './reputation.service';

interface Label {
  label: string;
  score: number;
}

interface ToxicityLabels {
  toxic: number;
  severe_toxic: number;
  obscene: number;
  threat: number;
  insult: number;
  identity_hate: number;
}

interface ToxicityResult {
  isToxic: boolean;
  needsModeration: boolean;
  isGibberish?: boolean;
  scores?: Partial<ToxicityLabels> & { comment?: ToxicityLabels };
  shouldBlock?: boolean;
}

export class ModerationService {
  private hf: HfInference;
  private readonly TOXIC_THRESHOLD = 0.7;
  private readonly MODERATION_THRESHOLD = 0.5;
  private readonly GIBBERISH_THRESHOLD = 0.6;

  constructor(config: RuntimeConfig) {
    const apiKey = config.huggingface?.apiKey;
    if (!apiKey) {
      console.warn('[Moderation Service] Hugging Face API key not configured');
    }
    this.hf = new HfInference(apiKey);
  }

  private async checkGibberish(text: string): Promise<boolean> {
    // Проверяем паттерны бессмысленного текста
    const patterns = {
      repeatedChars: /(.)\1{4,}/,  // Повторяющиеся символы
      noSpaces: /\S{20,}/,         // Длинный текст без пробелов
      randomChars: /[^\w\s.,!?-]{4,}/  // Случайные символы
    }

    let gibberishScore = 0

    // Проверка на основные паттерны
    if (patterns.repeatedChars.test(text)) gibberishScore += 0.3
    if (patterns.noSpaces.test(text)) gibberishScore += 0.3
    if (patterns.randomChars.test(text)) gibberishScore += 0.3

    // Проверка через языковую модель
    try {
      const result = await this.hf.textGeneration({
        model: 'gpt2',
        inputs: text,
        parameters: {
          max_new_tokens: 0,
          return_full_text: false
        }
      })

      // Если модель сильно "удивлена" текстом, это может быть признаком бессмысленности
      const perplexity = result.generated_text ? 0 : 0.3
      gibberishScore += perplexity
    } catch (error) {
      console.error('Error checking gibberish:', error)
    }

    return gibberishScore >= this.GIBBERISH_THRESHOLD
  }

  async checkToxicity(text: string): Promise<ToxicityResult> {
    if (!text || text.trim().length === 0) {
      return { isToxic: false, needsModeration: false, isGibberish: false };
    }

    try {
      const [result, isGibberish] = await Promise.all([
        this.hf.textClassification({
          model: 'unitary/multilingual-toxic-xlm-roberta',
          inputs: text
        }),
        this.checkGibberish(text)
      ]);

      if (!Array.isArray(result)) {
        console.warn('[Moderation Service] Unexpected response format:', result);
        return { isToxic: false, needsModeration: true, isGibberish: false };
      }

      const toxicLabels: ToxicityLabels = {
        toxic: this.findScore(result[0], 'toxic'),
        severe_toxic: this.findScore(result[0], 'severe_toxic'),
        obscene: this.findScore(result[0], 'obscene'),
        threat: this.findScore(result[0], 'threat'),
        insult: this.findScore(result[0], 'insult'),
        identity_hate: this.findScore(result[0], 'identity_hate')
      };

      const maxScore = Math.max(...Object.values(toxicLabels));
      const shouldBlock = maxScore > this.TOXIC_THRESHOLD || isGibberish;

      return {
        isToxic: maxScore > this.TOXIC_THRESHOLD,
        needsModeration: maxScore > this.MODERATION_THRESHOLD || isGibberish,
        isGibberish,
        shouldBlock,
        scores: toxicLabels
      };
    } catch (error) {
      console.error('[Moderation Service] Error checking toxicity:', error);
      // В случае ошибки отправляем на ручную модерацию
      return { isToxic: false, needsModeration: true, isGibberish: false };
    }
  }

  private findScore(result: any, label: string): number {
    const score = result[0]?.find((l: Label) => l.label === label)?.score;
    return score !== undefined ? score : 0;
  }

  async moderateWifiPoint(id: number, description: string): Promise<ToxicityResult> {
    if (!description || description.trim().length === 0) {
      return { isToxic: false, needsModeration: false, isGibberish: false };
    }

    const result = await this.checkToxicity(description);
    
    // Дополнительные правила модерации для Wi-Fi точек
    const extraRules = {
      // Проверка на спам или рекламу (пример)
      hasSpam: /\b(buy|sell|discount|offer|\$|%off)\b/i.test(description),
      // Проверка на URL (пример)
      hasUrl: /https?:\/\/[^\s]+/i.test(description),
    };

    const shouldBlock = result.shouldBlock || (extraRules.hasSpam && extraRules.hasUrl);
    
    // Обновляем toxicityScore в БД
    if (id) {
      await prisma.wifiPoint.update({
        where: { id },
        data: { 
          toxicityScore: Math.max(...Object.values(result.scores || {})),
          status: shouldBlock ? 'rejected' : 'pending'
        }
      });

      if (shouldBlock) {
        const wifiPoint = await prisma.wifiPoint.findUnique({
          where: { id },
          select: { userId: true }
        });

        if (wifiPoint?.userId) {
          await updateUserReputation(wifiPoint.userId, 'CONTENT_REMOVED');
        }
      }
    }
    
    return {
      ...result,
      shouldBlock,
      needsModeration: result.needsModeration || extraRules.hasSpam || extraRules.hasUrl
    };
  }

  async moderateReview(text: string): Promise<ToxicityResult> {
    if (!text || text.trim().length === 0) {
      return { isToxic: false, needsModeration: false };
    }

    const result = await this.checkToxicity(text);
    
    // Дополнительные правила модерации для отзывов
    const extraRules = {
      // Проверка на очень короткие отзывы (пример)
      tooShort: text.trim().length < 10,
      // Проверка на спам (пример)
      hasSpam: /\b(buy|sell|discount|offer|\$|%off)\b/i.test(text),
    };
    
    return {
      ...result,
      needsModeration: result.needsModeration || extraRules.tooShort || extraRules.hasSpam
    };
  }

  async moderateSecurityReport(risks: string, comment?: string): Promise<ToxicityResult> {
    if (!risks || risks.trim().length === 0) {
      return { isToxic: false, needsModeration: true }; // Пустые отчеты всегда на модерацию
    }

    const risksResult = await this.checkToxicity(risks);
    
    if (comment && comment.trim().length > 0) {
      const commentResult = await this.checkToxicity(comment);
      
      const mergedScores: Partial<ToxicityLabels> = {
        toxic: Math.max(risksResult.scores?.toxic || 0, commentResult.scores?.toxic || 0),
        severe_toxic: Math.max(risksResult.scores?.severe_toxic || 0, commentResult.scores?.severe_toxic || 0),
        obscene: Math.max(risksResult.scores?.obscene || 0, commentResult.scores?.obscene || 0),
        threat: Math.max(risksResult.scores?.threat || 0, commentResult.scores?.threat || 0),
        insult: Math.max(risksResult.scores?.insult || 0, commentResult.scores?.insult || 0),
        identity_hate: Math.max(risksResult.scores?.identity_hate || 0, commentResult.scores?.identity_hate || 0)
      };

      return {
        isToxic: risksResult.isToxic || commentResult.isToxic,
        needsModeration: risksResult.needsModeration || commentResult.needsModeration,
        scores: mergedScores
      };
    }
    
    return risksResult;
  }
}
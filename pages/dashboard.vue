<!-- pages/dashboard.vue -->
<template>
  <v-container
    fluid
    class="dashboard-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <ClientOnly>
      <div v-if="loading || !user" class="text-center py-12">
        <div v-if="loading" class="mb-4">
          <v-progress-circular indeterminate color="white" size="64" />
        </div>
        <div v-else class="text-white">
          {{ t('common.noAccess') || 'Please log in to access the dashboard' }}
        </div>
      </div>

      <div v-else>
        <!-- Email Verification Alert -->
        <v-alert
          v-if="!user.confirmedEmail"
          type="warning"
          variant="tonal"
          prominent
          class="mb-6"
        >
          <v-row align="center">
            <v-col cols="12" md="8">
              <div class="text-h6 mb-2">
                {{ t("auth.verifyEmailPanel") || "Verify your email" }}
              </div>
              <v-text-field
                v-model="verificationCode"
                :label="t('auth.codeFromEmail') || 'Code from email'"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-2"
                style="max-width: 300px"
              />
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <v-btn
                color="primary"
                variant="elevated"
                @click="verifyEmail"
                :loading="verifying"
              >
                {{ t("auth.confirm") || "Confirm" }}
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <!-- Header Card -->
        <v-card
          flat
          class="header-card mb-6"
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }"
        >
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="auto">
                <CustomAvatar
                  :image="user.profilePicture || undefined"
                  :initial="(user.name || user.email || 'U')?.charAt(0)"
                  size="80"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-h4 text-white mb-2">
                  {{ t("dashboard.welcome") || "Welcome" }},
                  {{ user.name || user.email || t("nav.user") }}!
                </div>
                <div class="d-flex align-center flex-wrap ga-2 mb-2">
                  <v-chip
                    v-if="currentBadge"
                    color="white"
                    variant="flat"
                    size="small"
                  >
                    <v-icon start size="small">mdi-shield-star</v-icon>
                    {{ currentBadge }}
                  </v-chip>
                  <v-chip color="white" variant="outlined" size="small">
                    <v-icon start size="small">mdi-trophy</v-icon>
                    {{ t("dashboard.rank") || "Rank" }}: #{{
                      user.leaderboardRank || "—"
                    }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="auto" class="ml-auto text-center">
                <div class="text-h3 text-white font-weight-bold">
                  {{ user.points || 0 }}
                </div>
                <div class="text-caption text-white">TRAVELFI Points</div>
                <v-progress-linear
                  :model-value="progressToNextLevel"
                  color="white"
                  height="8"
                  rounded
                  class="mt-2"
                  style="width: 200px"
                />
                <div class="text-caption text-white mt-1">
                  {{ contributionsToNext }}
                  {{ t("dashboard.toNextLevel") || "to next level" }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Stats Cards -->
        <v-row class="mb-6">
          <v-col cols="6" sm="3">
            <v-card
              flat
              class="stats-card pa-3"
              :style="{
                background: 'rgba(76, 175, 80, 0.3)',
                borderRadius: '12px',
              }"
            >
              <div class="d-flex align-center ga-3">
                <v-icon size="32" color="white">mdi-hand-heart</v-icon>
                <div>
                  <div class="text-h5 text-white font-weight-bold">
                    {{ stats.contributions }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("dashboard.contributions") || "Contributions" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              flat
              class="stats-card pa-3"
              :style="{
                background: 'rgba(33, 150, 243, 0.3)',
                borderRadius: '12px',
              }"
            >
              <div class="d-flex align-center ga-3">
                <v-icon size="32" color="white">mdi-wifi</v-icon>
                <div>
                  <div class="text-h5 text-white font-weight-bold">
                    {{ stats.wifiPoints }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("dashboard.wifiPoints") || "WiFi Points" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              flat
              class="stats-card pa-3"
              :style="{
                background: 'rgba(156, 39, 176, 0.3)',
                borderRadius: '12px',
              }"
            >
              <div class="d-flex align-center ga-3">
                <v-icon size="32" color="white">mdi-star</v-icon>
                <div>
                  <div class="text-h5 text-white font-weight-bold">
                    {{ stats.reviews }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("dashboard.reviews") || "Reviews" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3">
            <v-card
              flat
              class="stats-card pa-3"
              :style="{
                background: 'rgba(255, 152, 0, 0.3)',
                borderRadius: '12px',
              }"
            >
              <div class="d-flex align-center ga-3">
                <v-icon size="32" color="white">mdi-shield-check</v-icon>
                <div>
                  <div class="text-h5 text-white font-weight-bold">
                    {{ stats.securityChecks }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("dashboard.securityChecks") || "Security" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-card
          flat
          class="mb-6"
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }"
        >
          <v-card-title class="text-white">
            <v-icon start>mdi-lightning-bolt</v-icon>
            {{ t("dashboard.quickActions") || "Quick Actions" }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-btn
                  block
                  color="white"
                  variant="outlined"
                  :to="localePath('/wifi')"
                  size="large"
                >
                  <v-icon start>mdi-wifi-plus</v-icon>
                  {{ t("dashboard.addWifi") || "Add WiFi" }}
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  block
                  color="white"
                  variant="outlined"
                  :to="localePath('/esim')"
                  size="large"
                >
                  <v-icon start>mdi-sim</v-icon>
                  {{ t("dashboard.addEsim") || "Add eSIM" }}
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  block
                  color="white"
                  variant="outlined"
                  :to="localePath('/wifi')"
                  size="large"
                >
                  <v-icon start>mdi-map-search</v-icon>
                  {{ t("dashboard.findWifi") || "Find WiFi" }}
                </v-btn>
              </v-col>
              <v-col cols="6" md="3">
                <v-btn
                  block
                  color="white"
                  variant="outlined"
                  @click="checkSecurity"
                  size="large"
                >
                  <v-icon start>mdi-shield-check</v-icon>
                  {{ t("dashboard.checkSecurity") || "Check Security" }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Gamification Progress -->
        <v-card
          flat
          class="mb-6"
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }"
        >
          <v-card-title class="text-white">
            <v-icon start>mdi-trophy-variant</v-icon>
            {{ t("dashboard.progression") || "Your Progression" }}
          </v-card-title>
          <v-card-text>
            <div class="milestone-container">
              <div
                v-for="(milestone, index) in milestones"
                :key="milestone.name"
                class="milestone-item"
                :class="{
                  achieved: milestone.achieved,
                  current: milestone.current,
                }"
              >
                <div class="milestone-icon">
                  <v-icon
                    :color="milestone.achieved ? 'white' : 'grey'"
                    size="32"
                  >
                    {{ milestone.icon }}
                  </v-icon>
                </div>
                <div class="milestone-name text-white text-caption">
                  {{ milestone.name }}
                </div>
                <div class="milestone-value text-white text-caption">
                  {{ milestone.value }}
                </div>
                <div
                  v-if="index < milestones.length - 1"
                  class="milestone-connector"
                  :class="{ achieved: milestones[index + 1]?.achieved }"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>

                <!-- Active Features & Referral -->
        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card
              flat
              :style="{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                height: '100%',
              }"
            >
              <v-card-title class="text-white">
                <v-icon start>mdi-star-box</v-icon>
                {{ t("dashboard.activeFeatures") || "Active Features" }}
              </v-card-title>
              <v-card-text>
                <v-list v-if="activeFeatures.length > 0" bg-color="transparent">
                  <v-list-item
                    v-for="feature in activeFeatures"
                    :key="feature.id"
                    class="mb-2"
                    :style="{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }"
                  >
                    <template #prepend>
                      <v-icon color="white">mdi-star</v-icon>
                    </template>
                    <v-list-item-title class="text-white">
                      {{ feature.feature }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-2">
                      {{ t("dashboard.granted") || "Granted" }}:
                      {{ formatDate(feature.createdAt) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <v-alert v-else type="info" variant="tonal" color="white">
                  {{
                    t("dashboard.noFeatures") ||
                    "No active features yet. Keep contributing!"
                  }}
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card
              flat
              :style="{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                height: '100%',
              }"
            >
              <v-card-title class="text-white">
                <v-icon start>mdi-account-multiple</v-icon>
                {{ t("dashboard.referral") || "Referral Program" }}
              </v-card-title>
              <v-card-text>
                <div class="text-center">
                  <div class="text-h6 text-white mb-2">
                    {{ t("dashboard.yourCode") || "Your Referral Code" }}
                  </div>
                  <v-chip
                    color="white"
                    variant="flat"
                    size="large"
                    class="mb-4"
                  >
                    <span class="text-h6">{{ user.referralCode || "—" }}</span>
                  </v-chip>
                  <div class="text-white mb-4">
                    <div class="text-h5 font-weight-bold">
                      {{ stats.referrals }}
                      {{ t("dashboard.friends") || "friends" }}
                    </div>
                    <div class="text-caption">
                      +{{ stats.referrals * 5 }} TRAVELFI
                      {{ t("dashboard.earned") || "earned" }}
                    </div>
                  </div>
                  <v-btn
                    color="white"
                    variant="outlined"
                    @click="shareReferral"
                    block
                  >
                    <v-icon start>mdi-share-variant</v-icon>
                    {{ t("dashboard.shareCode") || "Share Code" }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activity -->
        <v-card
          flat
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }"
        >
          <v-card-title class="text-white">
            <v-icon start>mdi-history</v-icon>
            {{ t("dashboard.recentActivity") || "Recent Activity" }}
          </v-card-title>
          <v-card-text>
            <v-list
              v-if="recentContributions.length > 0"
              bg-color="transparent"
            >
              <v-list-item
                v-for="contribution in recentContributions"
                :key="contribution.id"
                class="mb-2"
                :style="{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                }"
              >
                <v-list-item-title class="text-white">
                  {{ contribution.type }} (+{{ contribution.points }} pts)
                </v-list-item-title>
                <v-list-item-subtitle class="text-grey-lighten-2">
                  {{ formatDate(contribution.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal" color="white">
              {{
                t("dashboard.noActivity") ||
                "No recent activity. Start contributing!"
              }}
            </v-alert>
          </v-card-text>
        </v-card>
      </div>
    </ClientOnly>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "~/composables/useUser";
import { formatDate } from "~/lib/formatDate";
import CustomAvatar from "@/components/CustomAvatar.vue";



const { t } = useI18n();
const { user, refresh } = useUser();
const localePath = useLocalePath();
const toast = useToast();

// Отладочный вывод
console.log('Dashboard: user state:', user.value);

const loading = ref(true);
const verifying = ref(false);
const verificationCode = ref("");

const stats = ref({
  contributions: 0,
  wifiPoints: 0,
  reviews: 0,
  securityChecks: 0,
  referrals: 0,
});

const activeFeatures = ref<any[]>([]);
const recentContributions = ref<any[]>([]);

const milestones = computed(() => {
  const total = stats.value.contributions;
  return [
    {
      name: "Beginner",
      value: 5,
      icon: "mdi-shield-star",
      achieved: total >= 5,
      current: total < 5,
    },
    {
      name: "Bronze",
      value: 10,
      icon: "mdi-shield-star",
      achieved: total >= 10,
      current: total >= 5 && total < 10,
    },
    {
      name: "Silver",
      value: 50,
      icon: "mdi-shield-star",
      achieved: total >= 50,
      current: total >= 10 && total < 50,
    },
    {
      name: "Gold",
      value: 100,
      icon: "mdi-shield-star",
      achieved: total >= 100,
      current: total >= 50 && total < 100,
    },
    {
      name: "Platinum",
      value: 250,
      icon: "mdi-shield-star",
      achieved: total >= 250,
      current: total >= 100 && total < 250,
    },
    {
      name: "Legend",
      value: 500,
      icon: "mdi-shield-crown",
      achieved: total >= 500,
      current: total >= 250,
    },
  ];
});

const currentBadge = computed(() => {
  const badges = user.value?.badges || [];
  if (badges.length === 0) return null;
  return badges[badges.length - 1];
});

const progressToNextLevel = computed(() => {
  const total = stats.value.contributions;
  if (total >= 500) return 100;
  if (total >= 250) return ((total - 250) / 250) * 100;
  if (total >= 100) return ((total - 100) / 150) * 100;
  if (total >= 50) return ((total - 50) / 50) * 100;
  if (total >= 10) return ((total - 10) / 40) * 100;
  if (total >= 5) return ((total - 5) / 5) * 100;
  return (total / 5) * 100;
});

const contributionsToNext = computed(() => {
  const total = stats.value.contributions;
  if (total >= 500) return 0;
  if (total >= 250) return 500 - total;
  if (total >= 100) return 250 - total;
  if (total >= 50) return 100 - total;
  if (total >= 10) return 50 - total;
  if (total >= 5) return 10 - total;
  return 5 - total;
});

onMounted(async () => {
  console.log('Dashboard: mounting, current user state:', user.value);
  if (!user.value) {
    console.log('Dashboard: no user found, fetching...');
    await refresh();
  }
  if (user.value) {
    console.log('Dashboard: user found, loading data...');
    await loadDashboardData();
  }
});

async function loadDashboardData() {
  loading.value = true;
  try {
    const response: any = await $fetch("/api/user/profile/stats");
    stats.value.contributions = response.contributions || 0;
    stats.value.wifiPoints = response.wifiPoints || 0;
    stats.value.reviews = response.reviews || 0;
    stats.value.securityChecks = 0; // TODO
    stats.value.referrals = 0; // TODO
    activeFeatures.value = response.features || [];
    recentContributions.value = response.recentContributions || [];
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    loading.value = false;
  }
}

async function verifyEmail() {
  if (!verificationCode.value) {
    toast.error({
      title: t("common.error") || "Error",
      message: t("auth.enterCode") || "Please enter verification code",
      position: "topRight",
      timeout: 3000,
    });
    return;
  }

  verifying.value = true;
  try {
    await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { code: verificationCode.value },
    } as any);

    // Сначала обновляем сессию с сервера
    await refresh();

    // Дополнительно принудительно обновляем confirmedEmail в состоянии
    if (user.value) {
      const { updateUser } = useUser();
      updateUser({ confirmedEmail: true });
    }

    toast.success({
      title: t("common.success") || "Success",
      message: t("auth.emailVerified") || "Email verified successfully!",
      position: "topRight",
      timeout: 3000,
    });

    verificationCode.value = "";
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Verification failed",
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    verifying.value = false;
  }
}

function checkSecurity() {
  toast.info({
    title: t("common.comingSoon") || "Coming Soon",
    message:
      t("dashboard.securityComingSoon") || "Security check feature coming soon",
    position: "topRight",
    timeout: 3000,
  });
}

function shareReferral() {
  if (!user.value?.referralCode) return;

  const text = `Join TravelFi with my code ${user.value.referralCode} and get +5 TRAVELFI points!`;

  if (navigator.share) {
    navigator.share({
      text,
      url: `https://travel-fi.com?ref=${user.value.referralCode}`,
    });
  } else {
    navigator.clipboard.writeText(user.value.referralCode);
    toast.success({
      title: t("common.success") || "Success",
      message: t("dashboard.codeCopied") || "Referral code copied!",
      position: "topRight",
      timeout: 2000,
    });
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 64px);
  overflow-x: hidden;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.milestone-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  position: relative;
  overflow-x: auto;
}

.milestone-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  min-width: 80px;
}

.milestone-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.milestone-item.achieved .milestone-icon {
  background: rgba(76, 175, 80, 0.5);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.milestone-item.current .milestone-icon {
  background: rgba(255, 193, 7, 0.5);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
  animation: pulse 2s infinite;
}

.milestone-connector {
  position: absolute;
  top: 30px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 0;
}

.milestone-connector.achieved {
  background: rgba(76, 175, 80, 0.6);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 960px) {
  .milestone-container {
    justify-content: flex-start;
    padding: 20px 10px;
  }

  .milestone-item {
    min-width: 70px;
  }

  .milestone-icon {
    width: 50px;
    height: 50px;
  }
}
</style>

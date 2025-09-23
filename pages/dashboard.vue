<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title class="text-primary text-h4">{{ t('dashboard.title') }}</v-card-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.points') }}</v-card-title>
          <v-card-text>
            <h2 class="text-primary">{{ user.points }} TRAVEL</h2>
            <div class="mt-4">
              <CustomChip v-for="badge in user.badges" :key="badge" color="accent" class="ma-1">
                {{ badge }}
              </CustomChip>
            </div>
          </v-card-text>
        </CustomCard>
      </v-col>

      <v-col cols="12" md="6">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.progress') }}</v-card-title>
          <v-card-text>
            <CustomProgress :value="user.points / 100 * 100" color="primary" />
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.notifications') }}</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item v-for="notification in notifications" :key="notification.id" class="my-2">
                <v-list-item-content>
                  <v-list-item-title>{{ notification.content }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.leaderboard') }}</v-card-title>
          <v-card-text>
            <CustomTable :headers="[{ text: t('dashboard.rank'), value: 'rank' }, { text: t('dashboard.user'), value: 'email' }]" :items="[{ rank: user.leaderboardRank, email: 'You' }]" />
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue'; // <--- Добавили импорт computed
import CustomButton from '@/components/CustomButton.vue';
import CustomCard from '@/components/CustomCard.vue';
import CustomChip from '@/components/CustomChip.vue';
import CustomProgress from '@/components/CustomProgress.vue';
import CustomTable from '@/components/CustomTable.vue';
import CustomIcon from '@/components/CustomIcon.vue';

const { t } = useI18n();
const user = useState('user', () => ({
  points: 0,
  badges: [],
  leaderboardRank: null,
}));
const notifications = ref([]);
const referrals = ref([]);
const isMobile = useMediaQuery('(max-width: 600px)');

// Правильно: используем computed для динамических мета-тегов
const headData = computed(() => ({
  title: t('dashboard.title'),
  meta: [
    { name: 'description', content: t('dashboard.meta_description') },
  ],
}));

// Правильно: передаем computed свойство в useHead
useHead(headData);

// Mock data fetch (replace with Prisma API calls when DB is ready)
onMounted(async () => {
  user.value = { points: 50, badges: ['Beginner'], leaderboardRank: 10 };
  notifications.value = [
    { id: 1, content: t('notifications.welcome') },
    { id: 2, content: t('notifications.first_login') },
  ];
  referrals.value = [
    { id: 1, email: 'friend1@example.com', status: 'Pending' },
  ];
});
</script>

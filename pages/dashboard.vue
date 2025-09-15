<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title class="text-primary text-h4">{{ t('dashboard.title') }}</v-card-title>
      </v-col>
    </v-row>

    <v-row>
      <!-- Points and Badges -->
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

      <!-- Progress -->
      <v-col cols="12" md="6">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.progress') }}</v-card-title>
          <v-card-text>
            <CustomProgress :value="user.points / 100 * 100" color="primary" />
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>

    <!-- Notifications -->
    <v-row>
      <v-col cols="12">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.notifications') }}</v-card-title>
          <v-card-text>
            <v-expansion-panels v-if="isMobile">
              <v-expansion-panel v-for="notification in notifications" :key="notification.id">
                <v-expansion-panel-title>
                  {{ notification.content }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <CustomButton :to="notification.action" color="accent">
                    {{ t('dashboard.view') }}
                  </CustomButton>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-list v-else>
              <v-list-item v-for="notification in notifications" :key="notification.id">
                <v-list-item-title>
                  <CustomIcon name="mdi-bell" color="primary" />
                  {{ notification.content }}
                </v-list-item-title>
                <template #append>
                  <CustomButton :to="notification.action" color="accent" size="small">
                    {{ t('dashboard.view') }}
                  </CustomButton>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>

    <!-- Referrals -->
    <v-row>
      <v-col cols="12">
        <CustomCard>
          <v-card-title class="text-primary">{{ t('dashboard.referrals') }}</v-card-title>
          <v-card-text>
            <v-expansion-panels v-if="isMobile">
              <v-expansion-panel v-for="referral in referrals" :key="referral.id">
                <v-expansion-panel-title>
                  {{ referral.suggestedUser.email }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <CustomButton color="accent">{{ t('dashboard.invite') }}</CustomButton>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-list v-else>
              <v-list-item v-for="referral in referrals" :key="referral.id">
                <v-list-item-title>{{ referral.suggestedUser.email }}</v-list-item-title>
                <template #append>
                  <CustomButton color="accent" size="small">{{ t('dashboard.invite') }}</CustomButton>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </CustomCard>
      </v-col>
    </v-row>

    <!-- Leaderboard -->
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

useHead({
  title: 'TravelFi Dashboard',
  meta: [
    { name: 'description', content: 'Your points and badges' },
  ],
});

// Mock data fetch (replace with Prisma API calls when DB is ready)
onMounted(async () => {
  user.value = { points: 50, badges: ['Beginner'], leaderboardRank: 10 };
  notifications.value = [
    { id: 1, content: t('notifications.wifi_nearby'), read: false, action: 'view_wifi' },
  ];
  referrals.value = [{ id: 1, suggestedUser: { email: 'friend@example.com' }, aiScore: 0.9 }];
});

// Cache for offline access
useStorage('user-cache', user);
</script>

<style scoped>
</style>

<!-- pages/profile/index.vue -->
<template>
  <v-container
    fluid
    class="user-profile-page pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <ClientOnly>
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="white" size="64" />
      </div>

      <div v-else-if="user">
        <!-- Breadcrumbs -->
        <v-breadcrumbs
          :items="breadcrumbs"
          class="pa-0 mb-4"
          :style="{ color: 'white' }"
        >
          <template v-slot:divider>
            <v-icon color="white" size="small">mdi-chevron-right</v-icon>
          </template>
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item
              :to="item.to"
              :disabled="item.disabled"
              class="text-white"
            >
              {{ item.title }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>

        <h1 class="text-h4 mb-6 text-white">
          {{ t("profile.title") || "My Profile" }}
        </h1>

        <!-- User Header Card -->
        <v-card
          class="user-header-card mb-6"
          flat
          :style="{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
          }"
        >
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="auto">
                <div class="d-flex flex-column align-center ga-3">
                  <CustomAvatar
                    :image="user.profilePicture || undefined"
                    :initial="(user.name || user.email || 'U')?.charAt(0)"
                    size="120"
                  />
                  <v-btn
                    color="white"
                    variant="outlined"
                    size="small"
                    @click="avatarDialog = true"
                  >
                    <v-icon start size="small">mdi-camera</v-icon>
                    {{ t("profile.changeAvatar") || "Change Avatar" }}
                  </v-btn>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <h2 class="text-h5 text-white mb-2">
                  {{ user.name || user.email || t("profile.noName") }}
                </h2>
                <div class="text-white mb-2">
                  <v-icon size="small" class="mr-1">mdi-email</v-icon>
                  {{ user.email || "N/A" }}
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <v-chip
                    :color="user.confirmedEmail ? 'success' : 'warning'"
                    size="small"
                    variant="flat"
                  >
                    <v-icon start size="small">
                      {{
                        user.confirmedEmail
                          ? "mdi-check-circle"
                          : "mdi-alert-circle"
                      }}
                    </v-icon>
                    {{
                      user.confirmedEmail
                        ? t("profile.emailConfirmed")
                        : t("profile.emailNotConfirmed")
                    }}
                  </v-chip>
                  <v-chip
                    v-if="user.walletAddress"
                    color="purple-darken-1"
                    size="small"
                    variant="flat"
                  >
                    <v-icon start size="small">mdi-wallet</v-icon>
                    {{ shortenAddress(user.walletAddress) }}
                  </v-chip>
                </div>
                <div v-if="user.badges && user.badges.length > 0" class="mt-3">
                  <div class="text-caption text-white mb-2">
                    {{ t("profile.badges") || "Badges" }}:
                  </div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="badge in user.badges"
                      :key="badge"
                      color="white"
                      variant="outlined"
                      size="small"
                    >
                      <v-icon start size="small">mdi-shield-star</v-icon>
                      {{ badge }}
                    </v-chip>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="auto" class="ml-auto">
                <div class="text-center">
                  <div class="text-h3 text-white font-weight-bold">
                    {{ user.points }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("profile.points") || "Points" }}
                  </div>
                  <div v-if="user.leaderboardRank" class="text-white mt-2">
                    <v-icon size="small" class="mr-1">mdi-trophy</v-icon>
                    {{ t("profile.rank") || "Rank" }}: #{{
                      user.leaderboardRank
                    }}
                  </div>
                  <UserRating
                    :reputation="stats.reputation"
                    :level="stats.level"
                    :total-votes="stats.totalVotes"
                    class="mt-4"
                  />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Stats Cards -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card
              class="stats-card pa-3"
              flat
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
                    {{ t("profile.contributions") || "Contributions" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card
              class="stats-card pa-3"
              flat
              :style="{
                background: 'rgba(33, 150, 243, 0.3)',
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
                    {{ t("profile.reviews") || "Reviews" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card
              class="stats-card pa-3"
              flat
              :style="{
                background: 'rgba(156, 39, 176, 0.3)',
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
                    {{ t("profile.wifiPoints") || "WiFi Points" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card
              class="stats-card pa-3"
              flat
              :style="{
                background: 'rgba(255, 152, 0, 0.3)',
                borderRadius: '12px',
              }"
            >
              <div class="d-flex align-center ga-3">
                <v-icon size="32" color="white">mdi-devices</v-icon>
                <div>
                  <div class="text-h5 text-white font-weight-bold">
                    {{ stats.sessions }}
                  </div>
                  <div class="text-caption text-white">
                    {{ t("profile.sessions") || "Sessions" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs -->
        <v-card
          flat
          :style="{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }"
        >
          <v-tabs v-model="activeTab" bg-color="transparent" color="white" grow>
            <v-tab value="overview">
              <v-icon start>mdi-account</v-icon>
              {{ t("profile.tabs.overview") || "Overview" }}
            </v-tab>
            <v-tab value="activity">
              <v-icon start>mdi-history</v-icon>
              {{ t("profile.tabs.activity") || "Activity" }}
            </v-tab>
            <v-tab value="settings">
              <v-icon start>mdi-cog</v-icon>
              {{ t("profile.tabs.settings") || "Settings" }}
            </v-tab>
          </v-tabs>

          <v-divider color="rgba(255, 255, 255, 0.2)" />

          <v-card-text class="pa-6">
            <v-window v-model="activeTab">
              <!-- Overview Tab -->
              <v-window-item value="overview">
                <div class="text-white">
                  <h3 class="text-h5 mb-4">
                    {{ t("profile.personalInfo") || "Personal Information" }}
                  </h3>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editForm.name"
                        :label="t('profile.name') || 'Name'"
                        variant="outlined"
                        color="white"
                        base-color="white"
                        class="white-text-field"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editForm.email"
                        :label="t('profile.email') || 'Email'"
                        variant="outlined"
                        color="white"
                        base-color="white"
                        class="white-text-field"
                        type="email"
                      />
                    </v-col>
                  </v-row>

                  <div class="mb-4">
                    <div class="text-caption text-grey-lighten-1 mb-2">
                      {{ t("profile.language") || "Language" }}
                    </div>
                    <div class="text-body-1">{{ user.language }}</div>
                  </div>

                  <div class="mb-4">
                    <div class="text-caption text-grey-lighten-1 mb-2">
                      {{ t("profile.createdAt") || "Member Since" }}
                    </div>
                    <div class="text-body-1">
                      {{ formatDate(user.createdAt) }}
                    </div>
                  </div>

                  <v-divider class="my-6" color="rgba(255, 255, 255, 0.2)" />

                  <h3 class="text-h5 mb-4">
                    {{ t("profile.walletConnection") || "Wallet Connection" }}
                  </h3>

                  <div v-if="user.walletAddress" class="mb-4">
                    <v-alert
                      type="success"
                      variant="outlined"
                      color="white"
                      class="mb-3"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <v-icon start>mdi-wallet</v-icon>
                          {{ shortenAddress(user.walletAddress) }}
                        </div>
                        <v-btn
                          color="error"
                          variant="text"
                          size="small"
                          @click="disconnectWallet"
                        >
                          {{ t("profile.disconnect") || "Disconnect" }}
                        </v-btn>
                      </div>
                    </v-alert>
                  </div>
                  <div v-else>
                    <v-btn
                      color="purple-darken-1"
                      variant="flat"
                      @click="connectWallet"
                    >
                      <v-icon start>mdi-wallet</v-icon>
                      {{ t("profile.connectWallet") || "Connect Wallet" }}
                    </v-btn>
                  </div>

                  <div v-if="user.walletAddress" class="mt-6">
                    <WalletBalance />
                  </div>

                  <v-divider class="my-6" color="rgba(255, 255, 255, 0.2)" />

                  <div class="d-flex ga-2">
                    <v-btn
                      color="white"
                      variant="flat"
                      @click="saveChanges"
                      :loading="saving"
                    >
                      {{ t("common.save") || "Save Changes" }}
                    </v-btn>
                    <v-btn color="white" variant="outlined" @click="resetForm">
                      {{ t("common.cancel") || "Cancel" }}
                    </v-btn>
                  </div>
                </div>
              </v-window-item>

              <!-- Activity Tab -->
              <v-window-item value="activity">
                <div class="text-white">
                  <h3 class="text-h5 mb-4">
                    {{ t("profile.recentActivity") || "Recent Activity" }}
                  </h3>

                  <div class="mb-6">
                    <h4 class="text-h6 mb-3">
                      {{ t("profile.contributions") || "Contributions" }}
                    </h4>
                    <v-list
                      v-if="
                        activityData.contributions &&
                        activityData.contributions.length > 0
                      "
                      bg-color="transparent"
                    >
                      <v-list-item
                        v-for="contrib in activityData.contributions"
                        :key="contrib.id"
                        :style="{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                        }"
                        class="mb-2"
                      >
                        <v-list-item-title class="text-white">
                          {{ contrib.type }} (+{{ contrib.points }} pts)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-grey-lighten-1">
                          {{ formatDate(contrib.createdAt) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <v-alert
                      v-else
                      type="info"
                      variant="outlined"
                      color="white"
                    >
                      {{
                        t("profile.noContributions") || "No contributions yet"
                      }}
                    </v-alert>
                  </div>

                  <div>
                    <h4 class="text-h6 mb-3">
                      {{ t("profile.activeFeatures") || "Active Features" }}
                    </h4>
                    <v-list
                      v-if="
                        activityData.features &&
                        activityData.features.length > 0
                      "
                      bg-color="transparent"
                    >
                      <v-list-item
                        v-for="feature in activityData.features"
                        :key="feature.id"
                        :style="{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                        }"
                        class="mb-2"
                      >
                        <template #prepend>
                          <v-icon color="white">mdi-star-box</v-icon>
                        </template>
                        <v-list-item-title class="text-white">
                          {{ feature.feature }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-grey-lighten-1">
                          {{ t("profile.grantedAt") || "Granted" }}:
                          {{ formatDate(feature.createdAt) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <v-alert
                      v-else
                      type="info"
                      variant="outlined"
                      color="white"
                    >
                      {{ t("profile.noFeatures") || "No active features" }}
                    </v-alert>
                  </div>
                </div>
              </v-window-item>

              <!-- Settings Tab -->
              <v-window-item value="settings">
                <div class="text-white">
                  <h3 class="text-h5 mb-4">
                    {{ t("profile.preferences") || "Preferences" }}
                  </h3>

                  <v-list bg-color="transparent">
                    <v-list-item
                      :style="{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                      }"
                      class="mb-2"
                    >
                      <v-list-item-title class="text-white">
                        {{
                          t("profile.pushNotifications") || "Push Notifications"
                        }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-grey-lighten-1">
                        {{
                          t("profile.pushDescription") ||
                          "Receive notifications about new features"
                        }}
                      </v-list-item-subtitle>
                      <template #append>
                        <v-switch
                          v-model="settings.pushEnabled"
                          color="success"
                          hide-details
                          @change="updatePushSettings"
                        />
                      </template>
                    </v-list-item>
                  </v-list>

                  <v-divider class="my-6" color="rgba(255, 255, 255, 0.2)" />

                  <h3 class="text-h5 mb-4 text-error">
                    {{ t("profile.dangerZone") || "Danger Zone" }}
                  </h3>

                  <v-btn
                    color="error"
                    variant="outlined"
                    @click="confirmDeleteDialog = true"
                  >
                    <v-icon start>mdi-delete-forever</v-icon>
                    {{ t("profile.deleteAccount") || "Delete Account" }}
                  </v-btn>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </div>
    </ClientOnly>

    <!-- Danger Zone: Confirm Delete Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500">
      <v-card :style="{background:'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)'}">
        <v-card-title class="text-error">
          <v-icon start color="error">mdi-alert</v-icon>
          {{ t('profile.confirmDeleteTitle') || 'Подтвердите удаление аккаунта' }}
        </v-card-title>
        <v-card-text class="text-white">
          {{ t('profile.confirmDeleteText') || 'Вы уверены, что хотите удалить аккаунт? Это действие необратимо.' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="white" variant="text" @click="confirmDeleteDialog = false">
            {{ t('common.cancel') || 'Отмена' }}
          </v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="handleDeleteAccount">
            {{ t('profile.confirmDelete') || 'Удалить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Avatar Upload Dialog -->
    <v-dialog v-model="avatarDialog" max-width="500">
      <v-card
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
        }"
      >
        <v-card-title class="text-white">
          {{ t("profile.uploadAvatar") || "Upload Avatar" }}
        </v-card-title>
        <v-card-text>
          <div class="text-white text-caption mb-3">
            {{ t('profile.avatarHint') || 'Only image files allowed. Max size: 200 KB.' }}
          </div>
          <v-file-input
            v-model="avatarFile"
            :label="t('profile.chooseImage') || 'Choose Image'"
            accept="image/*"
            prepend-icon="mdi-camera"
            variant="outlined"
            color="white"
            base-color="white"
            class="white-text-field"
            show-size
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="white" variant="text" @click="avatarDialog = false">
            {{ t("common.cancel") || "Cancel" }}
          </v-btn>
          <v-btn
            color="white"
            variant="flat"
            @click="uploadAvatar"
            :loading="uploading"
          >
            {{ t("common.upload") || "Upload" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
const confirmDeleteDialog = ref(false);
const deleting = ref(false);
import { useI18n } from "vue-i18n";
import { useUser } from "~/composables/useUser";
import { useCsrf } from "~/composables/useCsrf";
import { formatDate } from "~/lib/formatDate";
import CustomAvatar from "@/components/CustomAvatar.vue";
import WalletBalance from "@/components/WalletBalance.vue";
import UserRating from "@/components/UserRating.vue";



const { t } = useI18n();
const { user, refresh } = useUser();
const localePath = useLocalePath();
const toast = useToast();
const { csrfToken } = useCsrf();

const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const activeTab = ref("overview");
const avatarDialog = ref(false);
// v-file-input may return a File or an Array of File depending on props; allow any to avoid TS mismatch
const avatarFile = ref<any>(null);

const editForm = reactive({
  name: "",
  email: "",
});

const settings = reactive({
  pushEnabled: false,
});

const stats = reactive({
  contributions: 0,
  reviews: 0,
  wifiPoints: 0,
  sessions: 0,
  reputation: 0,
  level: 'NEUTRAL',
  totalVotes: 0
});

const activityData = reactive({
  contributions: [] as any[],
  features: [] as any[],
});

const breadcrumbs = computed(() => [
  {
    title: (t("nav.dashboard") as string) || "Dashboard",
    to: localePath("/dashboard"),
    disabled: false,
  },
  {
    title: t("profile.title") || "Profile",
    to: localePath("/profile"),
    disabled: true,
  },
]);

onMounted(async () => {
  await loadProfileData();
});

async function loadProfileData() {
  loading.value = true;
  try {
    if (user.value) {
      editForm.name = user.value.name || "";
      editForm.email = user.value.email || "";
      settings.pushEnabled = user.value.pushEnabled || false;

      // Load stats
      const response: any = await $fetch("/api/user/profile/stats");
      stats.contributions = response.contributions || 0;
      stats.reviews = response.reviews || 0;
      stats.wifiPoints = response.wifiPoints || 0;
      stats.sessions = response.sessions || 0;
      activityData.contributions = response.recentContributions || [];
      activityData.features = response.features || [];
    }
  } catch (error) {
    console.error("Failed to load profile data:", error);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  if (user.value) {
    editForm.name = user.value.name || "";
    editForm.email = user.value.email || "";
  }
}

async function saveChanges() {
  saving.value = true;
  try {
    await $fetch("/api/user/profile", {
      method: "PATCH",
      body: {
        name: editForm.name,
        email: editForm.email,
      },
    } as any);
    await refresh();
    toast.success({
      title: t("common.success") || "Success",
      message: t("profile.updateSuccess") || "Profile updated successfully",
      position: "topRight",
      timeout: 3000,
    });
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Failed to update profile",
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    saving.value = false;
  }
}

async function uploadAvatar() {
  if (!avatarFile.value) {
    toast.error({
      title: t("common.error") || "Error",
      message: t("profile.selectImage") || "Please select an image",
      position: "topRight",
      timeout: 3000,
    });
    return;
  }

  uploading.value = true;
  try {
    // support both File and File[]
    let file: File | null = null;
    if (Array.isArray(avatarFile.value)) file = avatarFile.value[0] || null;
    else file = avatarFile.value as File;
    if (!file) {
      toast.error({
        title: t("common.error") || "Error",
        message: t("profile.selectImage") || "Please select an image",
        position: "topRight",
        timeout: 3000,
      });
      uploading.value = false;
      return;
    }
    // Client-side validation: type and max size
    if (!file.type.startsWith('image/')) {
      toast.error({
        title: t('common.error') || 'Error',
        message: t('profile.invalidType') || 'Only image files are allowed',
        position: 'topRight',
        timeout: 3000,
      });
      uploading.value = false;
      return;
    }
    const MAX_BYTES = 200 * 1024; // 200 KB
    if (file.size > MAX_BYTES) {
      toast.error({
        title: t('common.error') || 'Error',
        message: t('profile.fileTooLarge') || 'File is too large. Max 200 KB',
        position: 'topRight',
        timeout: 5000,
      });
      uploading.value = false;
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    // Ensure we have a fresh CSRF token before POSTing (middleware requires it)
    if (!csrfToken.value) {
      try {
        const { csrf } = await $fetch('/api/csrf', { credentials: 'include' });
        csrfToken.value = csrf;
      } catch (e) {
        console.error('Failed to fetch CSRF token before avatar upload', e);
      }
    }
    if (csrfToken.value) formData.append('_csrf', csrfToken.value);

    // For multipart requests middleware can't read body to extract _csrf,
    // so also send it in header 'x-csrf-token'
    const headers: Record<string, string> = {};
    if (csrfToken.value) headers['x-csrf-token'] = csrfToken.value;

    await $fetch("/api/user/profile/avatar", {
      method: "POST",
      body: formData,
      headers,
      credentials: 'include',
    } as any);

    await refresh();
  avatarDialog.value = false;
  avatarFile.value = null;

    toast.success({
      title: t("common.success") || "Success",
      message: t("profile.avatarUpdated") || "Avatar updated successfully",
      position: "topRight",
      timeout: 3000,
    });
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Failed to upload avatar",
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    uploading.value = false;
  }
}

async function connectWallet() {
  try {
    if (typeof (window as any).ethereum === "undefined") {
      toast.error({
        title: t("common.error") || "Error",
        message: t("profile.metamaskNotFound") || "Metamask not installed",
        position: "topRight",
        timeout: 3000,
      });
      return;
    }

    const accounts: string[] = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    const walletAddress = accounts[0];

    // Ensure CSRF token present for POST
    if (!csrfToken.value) {
      try {
        const { csrf } = await $fetch('/api/csrf', { credentials: 'include' });
        csrfToken.value = csrf;
      } catch (e) {
        console.error('Failed to fetch CSRF token before wallet connect', e);
      }
    }

    await $fetch("/api/user/profile/wallet", {
      method: "POST" as any,
      body: { walletAddress, _csrf: csrfToken.value },
      credentials: 'include',
    });

    await refresh();

    toast.success({
      title: t("common.success") || "Success",
      message: t("profile.walletConnected") || "Wallet connected successfully",
      position: "topRight",
      timeout: 3000,
    });
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Failed to connect wallet",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function disconnectWallet() {
  if (
    !confirm(
      t("profile.confirmDisconnectWallet") ||
        "Are you sure you want to disconnect your wallet?",
    )
  ) {
    return;
  }

  try {
    await $fetch("/api/user/profile/wallet", {
      method: "DELETE" as any,
    });

    await refresh();

    toast.success({
      title: t("common.success") || "Success",
      message:
        t("profile.walletDisconnected") || "Wallet disconnected successfully",
      position: "topRight",
      timeout: 3000,
    });
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Failed to disconnect wallet",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function updatePushSettings() {
  try {
    await $fetch("/api/user/profile/push", {
      method: "PATCH" as any,
      body: { pushEnabled: settings.pushEnabled },
    });

    await refresh();

    toast.success({
      title: t("common.success") || "Success",
      message: t("profile.settingsUpdated") || "Settings updated successfully",
      position: "topRight",
      timeout: 3000,
    });
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Error",
      message: error?.data?.statusMessage || "Failed to update settings",
      position: "topRight",
      timeout: 3000,
    });
  }
}


async function handleDeleteAccount() {
  deleting.value = true;
  try {
    await $fetch("/api/user/profile", {
      method: "DELETE",
    });
    toast.success({
      title: t("common.success") || "Успешно",
      message: t("profile.deleteSuccess") || "Аккаунт удалён. До встречи!",
      position: "topRight",
      timeout: 3000,
    });
    confirmDeleteDialog.value = false;
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  } catch (error: any) {
    toast.error({
      title: t("common.error") || "Ошибка",
      message: error?.data?.statusMessage || t("profile.deleteError") || "Не удалось удалить аккаунт",
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    deleting.value = false;
  }
}

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
</script>

<style scoped>
.user-profile-page {
  color: white;
  overflow-x: hidden;
}

.user-header-card {
  transition: all 0.3s ease;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.white-text-field :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.7);
}

.white-text-field :deep(.v-field__input) {
  color: white;
}

.white-text-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7);
}

.white-text-field :deep(.v-field--focused .v-field__outline) {
  color: white;
}

.white-text-field :deep(.v-field--focused .v-label) {
  color: white;
}

:deep(.v-breadcrumbs-item) {
  color: white !important;
}

:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.7;
}

:deep(.v-tab) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-tab--selected) {
  color: white !important;
}

:deep(.v-tab__slider) {
  background-color: white !important;
}

:deep(.v-window) {
  background: transparent !important;
}
</style>

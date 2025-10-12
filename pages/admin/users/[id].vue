<!-- pages/admin/users/[id].vue -->
<template>
  <v-container
    fluid
    class="admin-user-profile pa-6"
    :style="{
      background:
        'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
      minHeight: 'calc(100vh - 64px)',
    }"
  >
    <!-- Breadcrumbs + Title on one line -->
    <div class="d-flex align-center justify-space-between mb-4">
      <v-breadcrumbs :items="breadcrumbs" class="pa-0" :style="{ color: 'white' }">
        <template v-slot:divider>
          <v-icon color="white" size="small">mdi-chevron-right</v-icon>
        </template>
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :to="item.to" :disabled="item.disabled" class="text-white">{{ item.title }}</v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <h1 class="text-h4 mb-0 text-white">{{ userData?.user.name || userData?.user.email || t('admin.user.noName') }}</h1>
    </div>

    <!-- Loading State -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="white"
      class="d-flex mx-auto mt-10"
      size="64"
    />

    <!-- User Profile Content -->
    <div v-else-if="userData">
      <!-- User Header -->
      <v-card
        class="user-header-card mb-6"
        :style="{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
        }"
      >
        <v-card-text class="pa-6">
          <div class="d-flex align-items-center flex-wrap ga-4">
            <CustomAvatar
              :image="userData.user.profilePicture"
              :initial="
                (userData.user.name || userData.user.email || 'U')?.charAt(0) ||
                'U'
              "
              size="80"
            />
            <div class="flex-grow-1">
              <h1 class="text-h4 text-white mb-2">
                {{
                  userData.user.name ||
                  userData.user.email ||
                  t("admin.user.noName")
                }}
              </h1>
              <div class="d-flex align-center flex-wrap ga-2 mb-2">
                <v-chip
                  :color="getStatusColor(userData.user.status)"
                  size="small"
                  variant="flat"
                >
                  {{ userData.user.status }}
                </v-chip>
                <v-chip
                  :color="getRoleColor(userData.user.role)"
                  size="small"
                  variant="flat"
                >
                  {{ userData.user.role }}
                </v-chip>
                <v-chip
                  v-if="userData.user.confirmedEmail"
                  color="success"
                  size="small"
                  variant="outlined"
                  class="text-white"
                >
                  <v-icon start size="small">mdi-check-circle</v-icon>
                  {{ t("admin.user.emailConfirmed") || "Email Confirmed" }}
                </v-chip>
              </div>
              <div class="text-white">
                <v-icon size="small" class="mr-1">mdi-email</v-icon>
                {{ userData.user.email || "N/A" }}
              </div>
              <div v-if="userData.user.walletAddress" class="text-white mt-1">
                <v-icon size="small" class="mr-1">mdi-wallet</v-icon>
                {{ shortenAddress(userData.user.walletAddress) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-h3 text-white font-weight-bold">
                {{ userData.user.points }}
              </div>
              <div class="text-caption text-white">
                {{ t("admin.user.points") || "Points" }}
              </div>
              <div v-if="userData.user.leaderboardRank" class="text-white mt-2">
                <v-icon size="small" class="mr-1">mdi-trophy</v-icon>
                {{ t("admin.user.rank") || "Rank" }}: #{{
                  userData.user.leaderboardRank
                }}
              </div>
            </div>
          </div>

          <!-- Badges -->
          <div
            v-if="userData.user.badges && userData.user.badges.length > 0"
            class="mt-4"
          >
            <div class="text-caption text-white mb-2">
              {{ t("admin.user.badges") || "Badges" }}:
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="badge in userData.user.badges"
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
                  {{ userData.stats.totalContributions }}
                </div>
                <div class="text-caption text-white">
                  {{ t("admin.user.contributions") || "Contributions" }}
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
                  {{ userData.stats.totalReviews }}
                </div>
                <div class="text-caption text-white">
                  {{ t("admin.user.reviews") || "Reviews" }}
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
                  {{ userData.stats.totalWifiPoints }}
                </div>
                <div class="text-caption text-white">
                  {{ t("admin.user.wifiPoints") || "WiFi Points" }}
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
                  {{ userData.stats.activeSessions }}
                </div>
                <div class="text-caption text-white">
                  {{ t("admin.user.activeSessions") || "Active Sessions" }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabs -->
      <v-card
        :style="{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        }"
      >
        <v-tabs v-model="activeTab" bg-color="transparent" color="white" grow>
          <v-tab value="overview">
            <v-icon start>mdi-information</v-icon>
            {{ t("admin.user.tabs.overview") || "Overview" }}
          </v-tab>
          <v-tab value="features">
            <v-icon start>mdi-star-box</v-icon>
            {{ t("admin.user.tabs.features") || "Features" }}
          </v-tab>
          <v-tab value="activity">
            <v-icon start>mdi-history</v-icon>
            {{ t("admin.user.tabs.activity") || "Activity" }}
          </v-tab>
          <v-tab value="sessions">
            <v-icon start>mdi-devices</v-icon>
            {{ t("admin.user.tabs.sessions") || "Sessions" }}
          </v-tab>
        </v-tabs>

        <v-divider color="rgba(255, 255, 255, 0.2)" />

        <v-card-text class="pa-6">
          <v-window v-model="activeTab">
            <!-- Overview Tab -->
            <v-window-item value="overview">
              <div class="text-white">
                <h3 class="text-h5 mb-4">
                  {{ t("admin.user.basicInfo") || "Basic Information" }}
                </h3>

                <v-row>
                  <v-col cols="12" md="6">
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">ID</div>
                      <div class="text-body-1">{{ userData.user.id }}</div>
                    </div>
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.email") || "Email" }}
                      </div>
                      <div class="text-body-1">
                        {{ userData.user.email || "N/A" }}
                        <div class="mt-2">
                          <v-checkbox
                            v-model="userData.user.confirmedEmail"
                            label="Confirmed"
                            color="success"
                            @click.stop
                            @change="toggleConfirmEmail"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.name") || "Name" }}
                      </div>
                      <div class="text-body-1">
                        {{ userData.user.name || "N/A" }}
                      </div>
                    </div>
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.language") || "Language" }}
                      </div>
                      <div class="text-body-1">
                        {{ userData.user.language }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.createdAt") || "Created At" }}
                      </div>
                      <div class="text-body-1">
                        {{ formatDate(userData.user.createdAt) }}
                      </div>
                    </div>
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.updatedAt") || "Updated At" }}
                      </div>
                      <div class="text-body-1">
                        {{ formatDate(userData.user.updatedAt) }}
                      </div>
                    </div>
                    <div class="info-item mb-3">
                      <div class="text-caption text-grey-lighten-1">
                        {{
                          t("admin.user.pushEnabled") || "Push Notifications"
                        }}
                      </div>
                      <div class="text-body-1">
                        <v-icon
                          :color="
                            userData.user.pushEnabled ? 'success' : 'error'
                          "
                          size="small"
                        >
                          {{
                            userData.user.pushEnabled
                              ? "mdi-check"
                              : "mdi-close"
                          }}
                        </v-icon>
                        {{
                          userData.user.pushEnabled
                            ? t("admin.common.enabled")
                            : t("admin.common.disabled")
                        }}
                      </div>
                    </div>
                    <div
                      v-if="userData.user.referralCode"
                      class="info-item mb-3"
                    >
                      <div class="text-caption text-grey-lighten-1">
                        {{ t("admin.user.referralCode") || "Referral Code" }}
                      </div>
                      <div class="text-body-1">
                        {{ userData.user.referralCode }}
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <v-divider class="my-6" color="rgba(255, 255, 255, 0.2)" />

                <h3 class="text-h5 mb-4">
                  {{ t("admin.user.actions") || "Actions" }}
                </h3>

                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    color="white"
                    variant="outlined"
                    @click="openRoleDialog"
                  >
                    <v-icon start>mdi-shield-account</v-icon>
                    {{ t("admin.user.changeRole") || "Change Role" }}
                  </v-btn>
                  <v-btn
                    color="white"
                    variant="outlined"
                    @click="openStatusDialog"
                  >
                    <v-icon start>mdi-account-cog</v-icon>
                    {{ t("admin.user.changeStatus") || "Change Status" }}
                  </v-btn>
                  <v-btn
                    color="white"
                    variant="outlined"
                    @click="resetPassword"
                  >
                    <v-icon start>mdi-lock-reset</v-icon>
                    {{ t("admin.user.resetPassword") || "Reset Password" }}
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="outlined"
                    class="ml-2"
                    @click="confirmDeleteDialog = true"
                  >
                    <v-icon start>mdi-delete-forever</v-icon>
                    {{ t('admin.user.deleteAccount') || 'Удалить пользователя' }}
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <!-- Features Tab -->
            <v-window-item value="features">
              <div class="text-white">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h5">
                    {{ t("admin.user.activeFeatures") || "Active Features" }}
                  </h3>
                  <v-btn
                    color="white"
                    variant="outlined"
                    size="small"
                    @click="openAddFeatureDialog"
                  >
                    <v-icon start size="small">mdi-plus</v-icon>
                    {{ t("admin.user.addFeature") || "Add Feature" }}
                  </v-btn>
                </div>

                <v-list
                  v-if="
                    userData.user.features && userData.user.features.length > 0
                  "
                  bg-color="transparent"
                  class="pa-0"
                >
                  <v-list-item
                    v-for="userFeature in userData.user.features"
                    :key="userFeature.id"
                    class="feature-item mb-2"
                    :style="{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }"
                  >
                    <template #prepend>
                      <v-icon color="white">mdi-star-box</v-icon>
                    </template>
                    <v-list-item-title class="text-white">
                      {{ userFeature.feature }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-1">
                      {{ t("admin.user.grantedAt") || "Granted" }}:
                      {{ formatDate(userFeature.createdAt) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <v-btn
                        color="error"
                        variant="text"
                        size="small"
                        @click="revokeFeature(userFeature.id)"
                      >
                        {{ t("admin.user.revoke") || "Revoke" }}
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>

                <v-alert
                  v-else
                  type="info"
                  variant="outlined"
                  color="white"
                  class="mt-4"
                >
                  {{ t("admin.user.noFeatures") || "No active features" }}
                </v-alert>
              </div>
            </v-window-item>

            <!-- Activity Tab -->
            <v-window-item value="activity">
              <div class="text-white">
                <h3 class="text-h5 mb-4">
                  {{ t("admin.user.recentActivity") || "Recent Activity" }}
                </h3>

                <!-- Contributions -->
                <div class="mb-6">
                  <h4 class="text-h6 mb-3">
                    {{ t("admin.user.contributions") || "Contributions" }}
                  </h4>
                  <v-list
                    v-if="
                      userData.user.contributions &&
                      userData.user.contributions.length > 0
                    "
                    bg-color="transparent"
                  >
                    <v-list-item
                      v-for="contrib in userData.user.contributions"
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
                      <template #append>
                        <v-chip
                          size="small"
                          :color="
                            contrib.status === 'approved'
                              ? 'success'
                              : 'warning'
                          "
                        >
                          {{ contrib.status }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-alert v-else type="info" variant="outlined" color="white">
                    {{
                      t("admin.user.noContributions") || "No contributions yet"
                    }}
                  </v-alert>
                </div>

                <!-- Audit Logs -->
                <div>
                  <h4 class="text-h6 mb-3">
                    {{ t("admin.user.auditLogs") || "Audit Logs" }}
                  </h4>
                  <v-list
                    v-if="
                      userData.user.auditLogs &&
                      userData.user.auditLogs.length > 0
                    "
                    bg-color="transparent"
                    class="audit-list"
                  >
                    <v-list-item
                      v-for="log in userData.user.auditLogs"
                      :key="log.id"
                      :style="{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                      }"
                      class="mb-2"
                    >
                      <v-list-item-title class="text-white">
                        {{ log.action }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-grey-lighten-1">
                        {{ formatDate(log.createdAt) }} •
                        {{ log.ipAddress || "N/A" }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-alert v-else type="info" variant="outlined" color="white">
                    {{ t("admin.user.noAuditLogs") || "No audit logs" }}
                  </v-alert>
                </div>
              </div>
            </v-window-item>

            <!-- Sessions Tab -->
            <v-window-item value="sessions">
              <div class="text-white">
                <h3 class="text-h5 mb-4">
                  {{ t("admin.user.activeSessions") || "Active Sessions" }}
                </h3>

                <v-list
                  v-if="
                    userData.user.sessions && userData.user.sessions.length > 0
                  "
                  bg-color="transparent"
                >
                  <v-list-item
                    v-for="session in userData.user.sessions"
                    :key="session.id"
                    :style="{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }"
                    class="mb-2"
                  >
                    <template #prepend>
                      <v-icon color="white">mdi-devices</v-icon>
                    </template>
                    <v-list-item-title class="text-white">
                      {{ getUserAgent(session.userAgent) }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-grey-lighten-1">
                      IP: {{ session.ipAddress || "Unknown" }} • {{ formatDate(session.createdAt) }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-grey-lighten-1">
                      {{ t("admin.user.expiresAt") || "Expires" }}:
                      {{ formatDate(session.expiresAt) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <v-btn
                        color="error"
                        variant="text"
                        size="small"
                        @click="terminateSession(session.id)"
                      >
                        {{ t("admin.user.terminate") || "Terminate" }}
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>

                <v-alert v-else type="info" variant="outlined" color="white">
                  {{ t("admin.user.noSessions") || "No active sessions" }}
                </v-alert>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="outlined"
      color="white"
      class="mt-6"
    >
      {{ error }}
    </v-alert>

    <!-- Danger Zone: Confirm Delete Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500">
      <v-card :style="{background:'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)'}">
        <v-card-title class="text-error">
          <v-icon start color="error">mdi-alert</v-icon>
          {{ t('admin.user.confirmDeleteTitle') || 'Подтвердите удаление пользователя' }}
        </v-card-title>
        <v-card-text class="text-white">
          {{ t('admin.user.confirmDeleteText') || 'Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="white" variant="text" @click="confirmDeleteDialog = false">
            {{ t('admin.common.cancel') || 'Отмена' }}
          </v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="handleDeleteUser">
            {{ t('admin.user.confirmDelete') || 'Удалить' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Role Dialog -->
    <v-dialog v-model="roleDialog" max-width="500">
      <v-card
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
        }"
      >
        <v-card-title class="text-white">{{
          t("admin.user.changeRole") || "Change Role"
        }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedRole"
            :items="['user', 'moderator', 'admin']"
            :label="t('admin.user.selectRole') || 'Select Role'"
            variant="outlined"
            color="white"
            base-color="white"
            class="white-text-field"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="white" variant="text" @click="roleDialog = false">{{
            t("admin.common.cancel") || "Cancel"
          }}</v-btn>
          <v-btn color="white" variant="flat" @click="updateRole">{{
            t("admin.common.save") || "Save"
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Status Dialog -->
    <v-dialog v-model="statusDialog" max-width="600">
      <v-card
        :style="{
          background:
            'linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-primary)) 100%)',
        }"
      >
        <v-card-title class="text-white">{{
          t("admin.user.changeStatus") || "Change Status"
        }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedStatus"
            :items="['active', 'suspended', 'banned']"
            :label="t('admin.user.selectStatus') || 'Select Status'"
            variant="outlined"
            color="white"
            base-color="white"
            class="white-text-field mb-4"
          />
          <v-textarea
            v-model="statusReason"
            :label="t('admin.user.reason') || 'Reason (required)'"
            variant="outlined"
            color="white"
            base-color="white"
            class="white-text-field"
            rows="3"
            :rules="[
              (v) =>
                !!v || t('admin.user.reasonRequired') || 'Reason is required',
            ]"
            required
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="white" variant="text" @click="statusDialog = false">{{
            t("admin.common.cancel") || "Cancel"
          }}</v-btn>
          <v-btn
            color="white"
            variant="flat"
            @click="updateStatus"
            :disabled="!statusReason || statusReason.trim().length === 0"
            >{{ t("admin.common.save") || "Save" }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
const confirmDeleteDialog = ref(false);
const deleting = ref(false);
async function handleDeleteUser() {
  deleting.value = true;
  try {
    await $fetch(`/api/admin/users/${userId.value}`, {
      method: "DELETE",
    });
    toast.success({
      title: t("admin.common.success") || "Успешно",
      message: t("admin.user.deleteSuccess") || "Пользователь удалён.",
      position: "topRight",
      timeout: 3000,
    });
    confirmDeleteDialog.value = false;
    setTimeout(() => {
      router.push(localePath("/admin/users"));
    }, 500);
  } catch (error: any) {
    toast.error({
      title: t("admin.common.error") || "Ошибка",
      message: error?.data?.statusMessage || t("admin.user.deleteError") || "Не удалось удалить пользователя",
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    deleting.value = false;
  }
}
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "~/lib/formatDate";
import CustomAvatar from "@/components/CustomAvatar.vue";

definePageMeta({ layout: "admin" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const toast = useToast();

const userId = computed(() => parseInt(route.params.id as string));
const loading = ref(true);
const error = ref("");
const userData = ref<any>(null);
const activeTab = ref("overview");

const roleDialog = ref(false);
const statusDialog = ref(false);
const selectedRole = ref("");
const selectedStatus = ref("");
const statusReason = ref("");

const breadcrumbs = computed(() => [
  {
    title: t("admin.breadcrumbs.home") || "Admin",
    to: localePath("/admin"),
    disabled: false,
  },
  {
    title: t("admin.breadcrumbs.users") || "Users",
    to: localePath("/admin/users"),
    disabled: false,
  },
  {
    title:
      userData.value?.user?.name ||
      userData.value?.user?.email ||
      `User #${userId.value}`,
    to: localePath(`/admin/users/${userId.value}`),
    disabled: true,
  },
]);

onMounted(async () => {
  await fetchUserData();
});

async function fetchUserData() {
  loading.value = true;
  error.value = "";
  try {
    const response: any = await $fetch(`/api/admin/users/${userId.value}`);
    userData.value = response;
    selectedRole.value = response.user?.role || "";
    selectedStatus.value = response.user?.status || "";
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage || err?.message || "Failed to load user data";
    toast.error({
      title: t("admin.common.error") || "Error",
      message: error.value,
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    loading.value = false;
  }
}

async function toggleConfirmEmail() {
  try {
    await $fetch(`/api/admin/users/${userId.value}/confirm-email`, {
      method: 'PATCH' as any,
      body: { confirmed: userData.value.user.confirmedEmail },
    })
    
    // Обновляем данные пользователя в админке
    await fetchUserData()
    
    // Если это текущий пользователь - обновляем его сессию
    const { user } = await $fetch('/api/auth/session')
    if (user && user.id === userId.value) {
      await refreshNuxtData()
    }
    
    toast.success({ title: t('admin.common.success') || 'Success', message: t('admin.user.emailConfirmedUpdated') || 'Email confirmation updated', position: 'topRight', timeout: 3000 })
  } catch (err: any) {
    toast.error({ title: t('admin.common.error') || 'Error', message: err?.data?.statusMessage || 'Failed to update', position: 'topRight', timeout: 3000 })
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    case "banned":
      return "error";
    default:
      return "grey";
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case "admin":
      return "red-darken-2";
    case "moderator":
      return "orange-darken-1";
    case "user":
      return "blue-darken-1";
    default:
      return "grey";
  }
}

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getUserAgent(ua: string): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Mobile")) return "Mobile Device";
  if (ua.includes("Chrome")) return "Chrome Browser";
  if (ua.includes("Firefox")) return "Firefox Browser";
  if (ua.includes("Safari")) return "Safari Browser";
  return "Desktop Browser";
}

function openRoleDialog() {
  roleDialog.value = true;
}

function openStatusDialog() {
  statusReason.value = "";
  statusDialog.value = true;
}

async function updateRole() {
  try {
    await $fetch(`/api/admin/users/${userId.value}/role`, {
      method: "PATCH" as any,
      body: { role: selectedRole.value },
    });
    toast.success({
      title: t("admin.common.success") || "Success",
      message: t("admin.user.roleUpdated") || "Role updated successfully",
      position: "topRight",
      timeout: 3000,
    });
    roleDialog.value = false;
    await fetchUserData();
  } catch (err: any) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: err?.data?.statusMessage || "Failed to update role",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function updateStatus() {
  if (!statusReason.value || statusReason.value.trim().length === 0) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: t("admin.user.reasonRequired") || "Reason is required",
      position: "topRight",
      timeout: 3000,
    });
    return;
  }

  try {
    await $fetch(`/api/admin/users/${userId.value}/status`, {
      method: "PATCH" as any,
      body: {
        status: selectedStatus.value,
        reason: statusReason.value.trim(),
      },
    });
    toast.success({
      title: t("admin.common.success") || "Success",
      message: t("admin.user.statusUpdated") || "Status updated successfully",
      position: "topRight",
      timeout: 3000,
    });
    statusDialog.value = false;
    statusReason.value = "";
    await fetchUserData();
  } catch (err: any) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: err?.data?.statusMessage || "Failed to update status",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function resetPassword() {
  if (
    !confirm(
      t("admin.user.confirmResetPassword") ||
        "Send password reset email to this user?",
    )
  ) {
    return;
  }
  try {
    await $fetch(`/api/admin/users/${userId.value}/reset-password`, {
      method: "POST" as any,
    });
    toast.success({
      title: t("admin.common.success") || "Success",
      message: t("admin.user.resetPasswordSent") || "Password reset email sent",
      position: "topRight",
      timeout: 3000,
    });
  } catch (err: any) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: err?.data?.statusMessage || "Failed to send reset email",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function terminateSession(sessionId: number) {
  if (
    !confirm(
      t("admin.user.confirmTerminateSession") || "Terminate this session?",
    )
  ) {
    return;
  }
  try {
    await $fetch(`/api/admin/users/${userId.value}/sessions/${sessionId}`, {
      method: "DELETE" as any,
    });
    toast.success({
      title: t("admin.common.success") || "Success",
      message: t("admin.user.sessionTerminated") || "Session terminated",
      position: "topRight",
      timeout: 3000,
    });
    await fetchUserData();
  } catch (err: any) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: err?.data?.statusMessage || "Failed to terminate session",
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function revokeFeature(userFeatureId: number) {
  if (
    !confirm(t("admin.user.confirmRevokeFeature") || "Revoke this feature?")
  ) {
    return;
  }
  try {
    await $fetch(`/api/admin/users/${userId.value}/features/${userFeatureId}`, {
      method: "DELETE" as any,
    });
    toast.success({
      title: t("admin.common.success") || "Success",
      message: t("admin.user.featureRevoked") || "Feature revoked",
      position: "topRight",
      timeout: 3000,
    });
    await fetchUserData();
  } catch (err: any) {
    toast.error({
      title: t("admin.common.error") || "Error",
      message: err?.data?.statusMessage || "Failed to revoke feature",
      position: "topRight",
      timeout: 3000,
    });
  }
}

function openAddFeatureDialog() {
  toast.info({
    title: t("admin.common.comingSoon") || "Coming Soon",
    message:
      t("admin.user.addFeatureComingSoon") ||
      "Add feature functionality coming soon",
    position: "topRight",
    timeout: 3000,
  });
}
</script>

<style scoped>
.admin-user-profile {
  color: white;
  overflow-x: hidden;
}

.user-header-card {
  transition: all 0.3s ease;
}

.white-text-field :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.7);
}

.white-text-field :deep(.v-field__input),
.white-text-field :deep(.v-field__input textarea) {
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

.filter-item {
  padding: 8px 16px !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
}

.filter-item:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.info-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item {
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.audit-list {
  max-height: 400px;
  overflow-y: auto;
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

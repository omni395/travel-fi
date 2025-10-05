<template>
  <ClientOnly>
    <v-container v-if="user">
      <v-row>
        <v-col cols="12">
          <v-card-title class="text-primary text-h4">{{
            t("dashboard.title")
          }}</v-card-title>
        </v-col>
      </v-row>

      <!-- Verification Panel at Top -->
      <v-row v-if="!user.confirmedEmail" class="mb-4">
        <v-col cols="12">
          <v-alert type="warning">
            {{ t("auth.verifyEmailPanel") }}
            <v-input
              v-model="code"
              :label="t('auth.codeFromEmail')"
              type="text"
              class="mt-2"
            />
            <CustomButton
              @click="verifyEmail"
              size="small"
              color="primary"
              class="ml-2"
              >{{ t("auth.confirm") }}</CustomButton
            >
          </v-alert>
        </v-col>
      </v-row>

      <!-- User Details Section - Readable Layout -->
      <v-row>
        <v-col cols="12">
          <CustomCard>
            <v-card-title class="text-primary">{{
              t("dashboard.userDetails")
            }}</v-card-title>
            <v-card-text>
              <!-- Profile Avatar -->
              <v-row class="mb-4">
                <v-col cols="12" md="2">
                  <div class="d-flex align-center">
                    <CustomAvatar
                      :image="user.profilePicture"
                      :initial="(user.name || user.email)?.charAt(0) || 'U'"
                      size="80"
                      class="mr-4"
                    />
                    <template v-if="user.profilePicture">
                      <v-icon
                        small
                        class="ml-2"
                        @click="editField('profilePicture')"
                        >mdi-pencil</v-icon
                      >
                    </template>
                    <template v-else>
                      <CustomButton
                        size="small"
                        color="primary"
                        @click="editField('profilePicture')"
                        >{{ t("common.add") }}</CustomButton
                      >
                    </template>
                  </div>
                </v-col>
                <v-col cols="12" md="10">
                  <h3 class="text-primary">
                    <template v-if="user.name">
                      {{ user.name }}
                      <v-icon small class="ml-2" @click="editField('name')"
                        >mdi-pencil</v-icon
                      >
                    </template>
                    <template v-else>
                      <CustomButton
                        size="small"
                        color="primary"
                        @click="editField('name')"
                        >{{ t("common.add") }}</CustomButton
                      >
                    </template>
                  </h3>
                  <v-chip color="primary" size="small">{{ user.role }}</v-chip>
                </v-col>
              </v-row>

              <!-- Key Info Row -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <CustomList color="secondary">
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.email")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <template v-if="user.email">
                          {{ user.email }}
                          <v-icon small class="ml-2" @click="editField('email')"
                            >mdi-pencil</v-icon
                          >
                        </template>
                        <template v-else>
                          <CustomButton
                            size="small"
                            color="primary"
                            @click="editField('email')"
                            >{{ t("common.add") }}</CustomButton
                          >
                        </template>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.points")
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        >{{ user.points }} TRAVELFI</v-list-item-subtitle
                      >
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.tokens")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <template v-if="user.walletAddress">
                          {{ user.walletAddress }}
                          <v-icon
                            small
                            class="ml-2"
                            @click="editField('walletAddress')"
                            >mdi-pencil</v-icon
                          >
                        </template>
                        <template v-else>
                          <CustomButton
                            size="small"
                            color="accent"
                            @click="editField('walletAddress')"
                            >{{ t("dashboard.connectWallet") }}</CustomButton
                          >
                        </template>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.language")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.language
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.walletAddress")
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        class="text-truncate"
                        style="max-width: 200px"
                      >
                        {{ user.walletAddress || "N/A" }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </CustomList>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomList color="secondary">
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.confirmedEmail")
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        ><v-chip
                          :color="user.confirmedEmail ? 'success' : 'error'"
                          >{{
                            user.confirmedEmail
                              ? t("common.yes")
                              : t("common.no")
                          }}</v-chip
                        ></v-list-item-subtitle
                      >
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.pushEnabled")
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        ><v-chip
                          :color="user.pushEnabled ? 'success' : 'error'"
                          >{{
                            user.pushEnabled ? t("common.yes") : t("common.no")
                          }}</v-chip
                        ></v-list-item-subtitle
                      >
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.referralCode")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.referralCode || "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.leaderboardRank")
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        >#{{
                          user.leaderboardRank || "N/A"
                        }}</v-list-item-subtitle
                      >
                    </v-list-item>
                  </CustomList>
                </v-col>
              </v-row>

              <!-- Badges -->
              <v-row v-if="user.badges && user.badges.length > 0" class="mb-4">
                <v-col cols="12">
                  <v-list-item-title class="text-primary">{{
                    t("dashboard.badges")
                  }}</v-list-item-title>
                  <div class="d-flex flex-wrap">
                    <CustomChip
                      v-for="badge in user.badges"
                      :key="badge"
                      color="accent"
                      class="ma-1"
                    >
                      {{ badge }}
                    </CustomChip>
                  </div>
                </v-col>
              </v-row>

              <!-- Dates and JSON -->
              <v-row>
                <v-col cols="12" md="6">
                  <CustomList color="secondary">
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.createdAt")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.updatedAt")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString()
                          : "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </CustomList>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomList color="secondary">
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.lastLocation")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.lastLocation
                          ? JSON.stringify(user.lastLocation)
                          : "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        t("dashboard.travelPreferences")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        user.travelPreferences
                          ? JSON.stringify(user.travelPreferences)
                          : "N/A"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </CustomList>
                </v-col>
              </v-row>
            </v-card-text>
          </CustomCard>
        </v-col>
      </v-row>

      <CustomButton @click="logout" color="error" class="mt-4"
        >Logout</CustomButton
      >

      <!-- Edit Field Dialog -->
      <CustomDialog
        v-model="showEditDialog"
        color="primary"
        :saveLabel="t('common.save')"
        :cancelLabel="t('common.cancel')"
        @save="saveField"
        @cancel="showEditDialog = false"
        max-width="400"
      >
        <v-card-title
          >{{ t("common.edit") }}
          {{ t("dashboard." + editFieldType) }}</v-card-title
        >
        <v-card-text>
          <template v-if="editFieldType === 'profilePicture'">
            <div class="mb-2 text-caption text-primary">
              {{ t("dashboard.allowedFormats") }}: PNG, JPG, WEBP, GIF.
              {{ t("dashboard.maxSize") }}: 200 KB
            </div>
            <v-file-input
              v-model="editFieldValue"
              :label="t('dashboard.profilePicture')"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              show-size
              prepend-icon="mdi-image"
            />
          </template>
          <template v-else>
            <v-text-field
              v-model="editFieldValue"
              :label="t('dashboard.' + editFieldType)"
            />
          </template>
        </v-card-text>
      </CustomDialog>
    </v-container>
    <v-container v-else>
      <v-progress-circular indeterminate color="primary" />
    </v-container>
  </ClientOnly>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useUser } from "~/composables/useUser";
import { ref } from "vue";
import { useCsrf } from "~/composables/useCsrf";

// Защита через глобальный middleware auth.js

const { t } = useI18n();
const localePath = useLocalePath();
const { user, clear } = useUser();
const toast = useToast();
const { csrfToken } = useCsrf();

useHead({
  title: t("dashboard.title"),
  meta: [{ name: "description", content: t("dashboard.meta_description") }],
});

const code = ref("");

const verifyEmail = async () => {
  try {
    await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { code: code.value, _csrf: csrfToken.value },
    });
    toast.success({
      title: t("auth.emailVerified"),
      message: t("auth.emailVerified"),
      position: "topRight",
      timeout: 3000,
    });
    const { user: sessionUser } = await $fetch("/api/auth/session");
    user.value = sessionUser;
  } catch (e) {
    toast.error({
      title: t("auth.verificationFailed"),
      message: t("auth.verificationFailed"),
      position: "topRight",
      timeout: 3000,
    });
  }
};

const logout = async () => {
  try {
    await clear();
    toast.success({
      title: t("auth.loggedOut"),
      message: t("auth.logoutSuccess"),
      position: "topRight",
      timeout: 3000,
    });
    await navigateTo(localePath("/"));
  } catch (error) {
    console.error("Logout error:", error);
    toast.error({
      title: t("auth.errorLogout"),
      message: t("auth.logoutFailed"),
      position: "topRight",
      timeout: 3000,
    });
  }
};

const isWalletLoading = ref(false);

const connectWallet = async () => {
  if (!window.ethereum) {
    toast.error(t("auth.metamaskMissing"));
    return;
  }
  isWalletLoading.value = true;
  try {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const { nonce } = await $fetch("/api/auth/siwe/nonce");
    const message = `Sign-in with Ethereum to TravelFi.\n\nAddress: ${account}\nNonce: ${nonce}`;
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, account],
    });
    await $fetch("/api/auth/siwe/verify", {
      method: "POST",
      body: { message, signature, _csrf: csrfToken.value },
    });
    toast.success(t("auth.walletConnected"));
    const { user: sessionUser } = await $fetch("/api/auth/session");
    user.value = sessionUser;
  } catch (e) {
    toast.error(t("auth.errorSIWE"));
  } finally {
    isWalletLoading.value = false;
  }
};

const showEditDialog = ref(false);
const editFieldType = ref("");
const editFieldValue = ref("");

const editField = (type) => {
  editFieldType.value = type;
  if (type === "profilePicture") {
    editFieldValue.value = null;
  } else {
    editFieldValue.value = user.value[type] || "";
  }
  showEditDialog.value = true;
};

const saveField = async () => {
  try {
    if (editFieldType.value === "profilePicture") {
      if (!editFieldValue.value) return;
      const file = editFieldValue.value;
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error({
          title: t("dashboard.profilePicture"),
          message: t("common.invalidFileType"),
          position: "topRight",
          timeout: 3000,
        });
        return;
      }
      if (file.size > 200 * 1024) {
        toast.error({
          title: t("dashboard.profilePicture"),
          message: t("dashboard.maxSizeExceeded"),
          position: "topRight",
          timeout: 3000,
        });
        return;
      }
      // Загрузка файла (можно через отдельный эндпоинт)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("_csrf", csrfToken.value);
      await $fetch("/api/user/upload-profile-picture", {
        method: "POST",
        body: formData,
      });
    } else {
      // ...проверка email/walletAddress как раньше...
      if (editFieldType.value === "email") {
        const exists = await $fetch("/api/user/check-email", {
          method: "POST",
          body: { value: editFieldValue.value },
        });
        if (exists && exists.userId && exists.userId !== user.value.id) {
          toast.error({
            title: t("dashboard.email"),
            message:
              t("dashboard.email") + ": " + t("dashboard.emailCollision"),
            position: "topRight",
            timeout: 3000,
          });
          return;
        }
      }
      if (editFieldType.value === "walletAddress") {
        const exists = await $fetch("/api/user/check-wallet", {
          method: "POST",
          body: { walletAddress: editFieldValue.value },
        });
        if (exists && exists.userId && exists.userId !== user.value.id) {
          toast.error({
            title: t("dashboard.walletAddress"),
            message:
              t("dashboard.walletAddress") +
              ": " +
              t("dashboard.walletCollision"),
            position: "topRight",
            timeout: 3000,
          });
          return;
        }
      }
      await $fetch("/api/user/update", {
        method: "POST",
        body: {
          field: editFieldType.value,
          value: editFieldValue.value,
          _csrf: csrfToken.value,
        },
      });
    }
    toast.success({
      title: t("common.success"),
      message: t("common.success"),
      position: "topRight",
      timeout: 3000,
    });
    const { user: sessionUser } = await $fetch("/api/auth/session");
    user.value = sessionUser;
    showEditDialog.value = false;
  } catch (e) {
    toast.error({
      title: t("common.error"),
      message: t("common.error"),
      position: "topRight",
      timeout: 3000,
    });
  }
};
</script>

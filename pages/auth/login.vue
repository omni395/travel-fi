<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <CustomCard>
          <v-card-title class="text-h5 text-center">{{
            t("auth.loginTitle")
          }}</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit" :disabled="isLoading">
              <v-text-field
                v-model="email"
                type="email"
                :label="t('auth.email')"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                color="primary"
                class="mb-4"
                required
              />
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :label="t('auth.password')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                color="primary"
                class="mb-2"
                required
              />
              <div class="d-flex justify-end mb-4">
                <NuxtLink
                  :to="$localePath('/auth/forgot')"
                  class="text-white"
                  >{{ t("auth.forgot") }}</NuxtLink
                >
              </div>
              <CustomButton
                type="submit"
                color="primary"
                :loading="isLoading"
                block
              >
                {{ t("auth.loginBtn") }}
              </CustomButton>
            </v-form>
            <v-divider class="my-6" />
            <div class="text-center mb-4">{{ t("auth.or") }}</div>
            <div class="d-flex flex-column gap-3">
              <CustomButton
                color="secondary"
                @click="loginWithGoogle"
                :loading="isLoading"
                block
              >
                <v-icon start>mdi-google</v-icon>
                Google
              </CustomButton>
              <CustomButton
                color="accent"
                @click="loginWithMetamask"
                :loading="isLoading"
                block
              >
                <v-icon start>mdi-ethereum</v-icon>
                Metamask
              </CustomButton>
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <span>{{ t("auth.noAccount") }}</span>
            <NuxtLink
              :to="$localePath('/auth/register')"
              class="ml-2 text-white"
              >{{ t("auth.registerLink") }}</NuxtLink
            >
          </v-card-actions>
        </CustomCard>
      </v-col>
    </v-row>
  </v-container>
  <v-overlay v-model="isLoading" scrim color="#0288D1" :opacity="0.1" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const csrfToken = ref("");

const router = useRouter();
const { t } = useI18n();
const localePath = useLocalePath();
const toast = useToast(); // Из nuxt-toast, auto-imported
const { login } = useUser(); // Используем новый API

onMounted(async () => {
  try {
    const { csrf } = await $fetch("/api/csrf");
    csrfToken.value = csrf;
  } catch (e) {
    console.error("CSRF fetch error:", e);
  }
});

async function onSubmit() {
  if (!email.value || !password.value) return;

  try {
    await login({
      email: email.value,
      password: password.value,
      _csrf: csrfToken.value,
    });

    toast.success({
      title: t("auth.successLogin"),
      message: t("auth.welcome"),
      position: "topRight",
      timeout: 3000,
    });

    await router.push(localePath("/dashboard"));
  } catch (e) {
    toast.error({
      title: t("auth.errorLogin"),
      message: t("auth.loginFailed"),
      position: "topRight",
      timeout: 3000,
    });
  }
}

async function loginWithGoogle() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("error")) {
      toast.error(t("auth.errorOAuth"));
      return;
    }
    window.location.href = "/api/auth/google";
  } catch (e) {
    toast.error(t("auth.errorOAuth"));
  }
}

async function loginWithMetamask() {
  try {
    if (!window.ethereum) {
      toast.error({
        title: t("auth.metamaskMissing"),
        message: t("auth.metamaskMissing"),
        position: "topRight",
        timeout: 3000,
      });
      return;
    }
    isLoading.value = true;
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
    toast.success({
      title: t("auth.walletConnected"),
      message: t("auth.walletConnected"),
      position: "topRight",
      timeout: 3000,
    });

    // Обновляем состояние пользователя после SIWE аутентификации
    const { fetchUser } = useUser();
    await fetchUser();

    await router.push(localePath("/dashboard"));
  } catch (e) {
    toast.error({
      title: t("auth.errorSIWE"),
      message: t("auth.errorSIWE"),
      position: "topRight",
      timeout: 3000,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped></style>

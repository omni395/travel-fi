<template>
  <v-dialog
    :color="color"
    class="travel-dialog"
    v-bind="$attrs"
  >
    <v-card>
      <slot />
      <v-card-actions class="justify-end">
        <CustomButton color="success" text-color="white" class="text-button" @click="$emit('save')">
          {{ saveLabel }}
        </CustomButton>
        <CustomButton color="error" text-color="white" class="text-button" @click="$emit('cancel')">
          {{ cancelLabel }}
        </CustomButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
defineProps({
  color: { type: String, default: 'primary' },
  saveLabel: { type: String, default: 'Сохранить' },
  cancelLabel: { type: String, default: 'Отмена' }
})
</script>
<style scoped>
.travel-dialog .v-dialog-content {
  background: #FFFFFF; /* white for readability */
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}
.white--text {
  color: #fff !important;
}
.text-button {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4 elevation-2">
          <v-card-title class="text-h4 font-weight-bold primary--text">
            About TravelFi
          </v-card-title>
          <v-card-text>
            <p>TravelFi is an innovative platform that combines traditional financial services with blockchain technology to provide seamless travel experiences. Our mission is to make your journeys safer, more connected, and financially empowered through decentralized solutions.</p>
            <ul>
              <li>Secure Web3 authentication via MetaMask</li>
              <li>Global Wi-Fi and eSIM access</li>
              <li>User-friendly dashboard for managing trips and assets</li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="$router.push('/')">На главную</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Компонент страницы About
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
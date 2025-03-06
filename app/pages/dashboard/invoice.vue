<script lang="ts" setup>
import StrikeAccountSelector from '~/components/StrikeAccountSelector.vue'

definePageMeta({
  layout: 'dashboard',
})

const accountSelector = useTemplateRef<InstanceType<typeof StrikeAccountSelector>>('account-selector')
const account = computed(() => accountSelector.value?.account)

const clearAccount = () => {
  accountSelector.value?.clearAccount()
}
</script>

<template>
  <div class="max-w-lg">
    <h2 class="mb-4 text-xl font-semibold">Invoice</h2>

    <StrikeAccountSelector ref="account-selector" @clear-account="clearAccount" />

    <StrikeInvoice v-if="account" class="mt-4" :handle="account.handle" />
  </div>
</template>

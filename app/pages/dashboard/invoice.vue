<script lang="ts" setup>
import StrikeAccountSelector from '~/components/StrikeAccountSelector.vue'

definePageMeta({
  layout: 'dashboard',
})

const accountSelector = useTemplateRef('account-selector')
const handle = computed(() => accountSelector.value?.connection?.profile?.handle)

const clearAccount = () => {
  accountSelector.value?.clearConnection()
}

const isEditMode = computed(() => accountSelector.value?.isEditMode)
</script>

<template>
  <div>
    <h2 class="mb-4 text-xl font-semibold">Invoice</h2>

    <StrikeAccountSelector ref="account-selector" @clear-account="clearAccount" />

    <StrikeInvoice v-if="handle && !isEditMode" class="mt-4" :handle="handle" />
  </div>
</template>

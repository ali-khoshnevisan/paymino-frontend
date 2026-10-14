<template>
  <div class="flex min-h-dvh flex-col">
    <LayoutAppHeader />
    <main id="main" class="flex-1" tabindex="-1">
      <slot />
    </main>
    <LayoutAppFooter />
    <UiToaster />
  </div>
</template>

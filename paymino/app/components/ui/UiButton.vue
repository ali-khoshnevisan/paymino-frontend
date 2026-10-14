<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'link'
    size?: 'sm' | 'md' | 'lg'
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', loading: false, disabled: false, block: false },
)

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none',
  'rounded-[var(--radius-control)] transition-colors duration-150',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
  'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
  {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-12 px-6 text-base',
  }[props.size],
  {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 disabled:bg-navy-300 aria-disabled:bg-navy-300',
    accent: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 disabled:bg-accent-200 aria-disabled:bg-accent-200',
    secondary:
      'border border-line bg-white text-navy-900 hover:border-navy-200 hover:bg-navy-50 active:bg-navy-100 disabled:text-navy-300',
    ghost: 'text-navy-800 hover:bg-navy-50 active:bg-navy-100 disabled:text-navy-300',
    danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50 active:bg-red-100 disabled:text-red-300',
    link: 'h-auto px-0 text-accent-700 underline-offset-4 hover:underline',
  }[props.variant],
  props.block ? 'w-full' : '',
])

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <NuxtLink v-if="to && !isDisabled" :to="to" :class="classes">
    <slot />
  </NuxtLink>
  <a v-else-if="href && !isDisabled" :href="href" :class="classes" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
  <button v-else :type="type" :class="classes" :disabled="isDisabled" :aria-busy="loading || undefined">
    <LoaderCircle v-if="loading" class="size-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>

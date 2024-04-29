<template>
  <app-header></app-header>
  <main>
    <h1 class="text-3xl font-bold text-center">
      {{title}}
    </h1>
    <div class="w-10 h-10">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    </div>
  </main>
  <app-footer></app-footer>
</template>

<script>
import AppHeader from "@/app/components/theme-components/app-header-component/app-header";
import AppFooter from "@/app/components/theme-components/app-footer-component/app-footer";

export default {
  components: {
    'app-header': AppHeader,
    'app-footer': AppFooter
  },
  data() {
    return {
      title: 'Hello world 316662'
    }
  }
}
</script>

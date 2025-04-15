<script>
  import ShepherdFooter from './shepherd-footer.svelte';
  import ShepherdHeader from './shepherd-header.svelte';
  import ShepherdText from './shepherd-text.svelte';
  import { isUndefined } from '../utils/type-check.ts';

  export let descriptionId, labelId, step;
</script>

<div class="shepherd-content">
  {#if !isUndefined(step.options.title) || (step.options.cancelIcon && step.options.cancelIcon.enabled)}
    <ShepherdHeader {labelId} {step} />
  {/if}

  <div class="shepherd-body">
    {#if !isUndefined(step.options.text)}
      <ShepherdText {descriptionId} {step} />
    {/if}

    {#if (Array.isArray(step.options.buttons) && step.options.buttons.length) || step.options.footerText}
      <ShepherdFooter {step} />
    {/if}
  </div>
</div>

<style global>
  .shepherd-content {
    outline: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .shepherd-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
</style>

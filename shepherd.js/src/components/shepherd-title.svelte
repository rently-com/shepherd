<script>
  import { afterUpdate } from 'svelte';
  import { isFunction } from '../utils/type-check.ts';

  export let labelId, title, titleIcon;

  // Reactive assignment to handle function-based title and titleIcon
  $: resolvedTitle = isFunction(title) ? title() : title;
  $: resolvedTitleIcon = isFunction(titleIcon) ? titleIcon() : titleIcon;
</script>

<!-- svelte-ignore a11y-missing-content -->
<div id={labelId} class="shepherd-title">
  <div class="shepherd-title-container">
    {#if resolvedTitleIcon}
      <img class="shepherd-title-icon" src={resolvedTitleIcon} alt="" />
    {/if}
    <div class="shepherd-title-text">{resolvedTitle}</div>
  </div>
</div>

<style global>
  .shepherd-title-text {
    color: #111827;
    font-size: 1rem;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: 0px;
  }
  .shepherd-title-icon {
    display: block;
    width: 24px;
    height: 24px;
  }
  .shepherd-title-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>

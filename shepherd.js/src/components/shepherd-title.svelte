<script>
  import { afterUpdate } from 'svelte';
  import { isFunction, isUndefined } from '../utils/type-check.ts';

  export let labelId, title, titleIcon, element;

  // Reactive assiDSgnment to handle function-based title and titleIcon
  $: resolvedTitle = isFunction(title) ? title() : title;
  $: resolvedTitleIcon = titleIcon;
  afterUpdate(() => {
    if (isUndefined(resolvedTitleIcon)) {
      return;
    }
    if (isFunction(titleIcon)) {
      resolvedTitleIcon = titleIcon();
    }
    element.innerHTML = resolvedTitleIcon;
  });
</script>

<div id={labelId} class="shepherd-title">
  <div class="shepherd-title-container">
    {#if resolvedTitleIcon}
      <div bind:this={element} class="shepherd-title-icon"></div>
    {/if}
    {#if resolvedTitle}
      <div class="shepherd-title-text">{resolvedTitle}</div>
    {/if}
  </div>
</div>

<style global>
  .shepherd-title-text {
    color: #111827;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5rem;
    letter-spacing: 0px;
    font-family: Inter;
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
    justify-content: center;
  }
</style>

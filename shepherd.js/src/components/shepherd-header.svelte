<script>
  import ShepherdCancelIcon from './shepherd-cancel-icon.svelte';
  import ShepherdTitle from './shepherd-title.svelte';

  export let labelId, step;
  let title, cancelIcon, titleIcon;

  $: {
    title = step.options.title;
    cancelIcon = step.options.cancelIcon;
    titleIcon = step.options.titleIcon;
  }
</script>

<header class="shepherd-header">
  {#if title}
    <ShepherdTitle {labelId} {title} {titleIcon}/>
  {/if}

  {#if cancelIcon && cancelIcon.enabled}
    <ShepherdCancelIcon {cancelIcon} {step} />
  {/if}
</header>

<style global>
  .shepherd-header {
    align-items: center;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    display: flex;
    line-height: 2em;
  }

  .shepherd-has-title .shepherd-content .shepherd-header {
    background: #FFFFFF;
  }
</style>

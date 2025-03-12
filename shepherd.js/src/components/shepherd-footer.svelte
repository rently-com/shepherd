<script>
  import { isFunction } from 'src/utils/type-check';
  import ShepherdButton from './shepherd-button.svelte';

  export let step, element, footerText;

  $: buttons = step.options.buttons;
  $: footerText = isFunction(step.options.footerText) ? step.options.footerText() : step.options.footerText;
</script>

<footer class="shepherd-footer">
  {#if footerText}
    <span>{footerText}</span>
  {/if}
  {#if buttons}
    {#each buttons as config}
      <ShepherdButton {config} {step} />
    {/each}
  {/if}
</footer>

<style global>
  .shepherd-footer {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    display: flex;
    justify-content: flex-end;
    padding: 0 0.75rem 0.75rem;
  }

  .shepherd-footer .shepherd-button:last-child {
    margin-right: 0;
  }

  .sheperd-footer-text {
    font-family: Inter;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 8px;
    font-weight: 400;
    color: #4B5563;
  }
</style>

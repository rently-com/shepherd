<script>
  import { isFunction } from '../utils/type-check.ts';

  export let config, step;
  let action, classes, disabled, label, secondary, text;

  $: {
    action = config.action ? config.action.bind(step.tour) : null;
    classes = config.classes;
    disabled = config.disabled ? getConfigOption(config.disabled) : false;
    label = config.label ? getConfigOption(config.label) : null;
    secondary = config.secondary;
    text = config.text ? getConfigOption(config.text) : null;
  }

  function getConfigOption(option) {
    if (isFunction(option)) {
      return (option = option.call(step));
    }
    return option;
  }
</script>

<button
  aria-label={label ? label : null}
  class={`${classes || ''} shepherd-button ${
    secondary ? 'shepherd-button-secondary' : ''
  }`}
  {disabled}
  on:click={action}
  tabindex="0"
  type="button"
>
  {@html text}
</button>

<style global>
  .shepherd-button {
    background: #2B4790;
    border: 0;
    border-radius: 0.75rem;
    color: #FFFFFF;
    cursor: pointer;
    margin-right: 0.5rem;
    padding: 0.5rem 1.5rem;
    line-height: 1.25rem;
    font-weight: 500;
    font-size: 0.875rem;
    text-align: center;
    transition: all 0.5s ease;
  }

  .shepherd-button:not(:disabled):hover {
    background: rgb(25, 111, 204);
    color: rgba(255, 255, 255, 0.75);
  }

  .shepherd-button.shepherd-button-secondary {
    background: rgb(241, 242, 243);
    color: rgba(0, 0, 0, 0.75);
  }

  .shepherd-button.shepherd-button-secondary:not(:disabled):hover {
    background: rgb(214, 217, 219);
    color: rgba(0, 0, 0, 0.75);
  }

  .shepherd-button:disabled {
    cursor: not-allowed;
  }
</style>

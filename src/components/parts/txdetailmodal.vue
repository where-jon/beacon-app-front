<template>
  <transition name="modal" appear>
    <div class="modal modal-overlay" @click.self="$emit('close')">
      <div class="modal-window" :style="modalStyle">
        <div class="modal-content" :style="modalStyle">
          <slot/>
        </div>
        <footer class="md-footer" :style="modalStyle">
          <b-button class="btn" @click="$emit('close')">OK</b-button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
  },
  computed: {
    modalStyle: function() {
      return {
          color: this.color,
          backgroundColor: this.bgColor,
          border: `1px solid ${this.bgColor}`,
      }
    }
  }
}
</script>

<style scoped lang="scss">

  .modal.modal-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 30;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-window {
    border-radius: 4px;
    overflow: hidden;
  }

  .modal-content {
    padding: 10px 20px;
  }

  .md-footer {
    padding: 10px;
    text-align: center;
  }

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.4s;
  .modal-window {
    transition: opacity 0.4s, transform 0.4s;
  }
}

.modal-leave-active {
  transition: opacity 0.6s ease 0.4s;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
  .modal-window {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
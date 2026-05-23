<template>

  <div id="userLayout" :class="['user-layout-wrapper', isMobile && 'mobile']">
    <div class="container">
      <div class="fx-layer" aria-hidden="true">
        <div class="fx-gradient"></div>
        <div class="fx-grid"></div>
      </div>
      <div class="user-layout-content">
        <div class="top">
          <div class="header">
            <a href="/" class="login-brand">
              <img src="/assets/brand/lockup.svg" alt="QuantBrew" style="height: 32px; width: auto;" />
            </a>
          </div>
        </div>

        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deviceMixin } from '@/store/device-mixin'

export default {
  name: 'UserLayout',
  mixins: [deviceMixin],
  mounted () {
    document.body.classList.add('userLayout')
  },
  beforeDestroy () {
    document.body.classList.remove('userLayout')
  }
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    width: 100%;
    min-height: 100%;
    background: #f6f8fa;
    position: relative;
    transition: background 0.3s ease;

    .fx-layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;

      .fx-gradient {
        position: absolute;
        inset: 0;
        background: radial-gradient(800px 400px at 50% 0%, rgba(24, 144, 255, 0.05), transparent 70%);
        filter: blur(40px);
        transform: translateZ(0);
      }

      .fx-grid {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
        background-size: 32px 32px;
        background-position: center top;
      }
    }

    .user-layout-content {
      padding: 64px 0 48px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
      z-index: 1;

      .top {
        text-align: center;
        margin-bottom: 24px;

        .header {
          height: 48px;
          line-height: 48px;

          .login-brand {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            opacity: 0.9;
            transition: opacity 0.2s ease;

            &:hover {
              opacity: 1;
            }
          }
        }
      }

      .main {
        min-width: 320px;
        width: 480px;
        margin: 0 auto;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    a {
      text-decoration: none;
    }
  }
}

/* Dark Theme Overrides */
body.dark,
body.realdark {
  #userLayout.user-layout-wrapper {
    .container {
      background: #09090b;

      .fx-layer {
        .fx-gradient {
          background: radial-gradient(800px 400px at 50% 0%, rgba(255, 255, 255, 0.02), transparent 70%);
        }
        .fx-grid {
          background-image: linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px);
        }
      }

      .user-layout-content {
        .top {
          .header {
            .login-brand {
              filter: invert(1) brightness(0.9);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 576px) {
  #userLayout.user-layout-wrapper .container .user-layout-content .main {
    width: 92vw;
  }
}
</style>

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
              <img src="/assets/brand/lockup.svg" alt="PostSoma Core" style="height: 32px; width: auto;" />
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
    background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
    background-size: 100%;
    //padding: 50px 0 84px;
    position: relative;

    .fx-layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;

      .fx-gradient {
        position: absolute;
        inset: -20% -20% -20% -20%;
        background: radial-gradient(1200px 600px at 10% 10%, rgba(78, 161, 255, 0.18), transparent 60%),
                    radial-gradient(900px 500px at 90% 20%, rgba(127, 92, 255, 0.18), transparent 60%),
                    radial-gradient(800px 500px at 30% 90%, rgba(0, 210, 170, 0.14), transparent 60%);
        filter: blur(20px);
        animation: fxFloat 18s ease-in-out infinite alternate;
        transform: translateZ(0);
      }

      .fx-grid {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 44px 44px, 44px 44px;
        background-position: 0 0, 0 0;
        mix-blend-mode: overlay;
        animation: gridDrift 40s linear infinite;
      }
    }

    .user-layout-content {
      padding: 40px 0 32px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
      z-index: 1;

      .top {
        text-align: center;

        .header {
          height: 56px;
          line-height: 56px;

          .login-brand {
            color: #1f2937;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0;
            text-decoration: none;
          }
        }
        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.45);
          margin-top: 12px;
          margin-bottom: 40px;
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

@media (max-width: 576px) {
  #userLayout.user-layout-wrapper .container .user-layout-content .top .header .login-brand {
    font-size: 24px;
  }
  #userLayout.user-layout-wrapper .container .user-layout-content .main {
    width: 92vw;
  }
}

@keyframes fxFloat {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
  50%  { transform: translate3d(1%, 2%, 0) scale(1.02); }
  100% { transform: translate3d(3%, -2%, 0) scale(1.04); }
}

@keyframes gridDrift {
  0%   { background-position: 0 0, 0 0; transform: rotate(0deg); }
  50%  { background-position: 22px 22px, 22px 22px; }
  100% { background-position: 44px 44px, 44px 44px; transform: rotate(0.01turn); }
}
</style>

<template lang="pug">
.c-spinner
  .c-spinner__one
  .c-spinner__two
</template>
<style lang="stylus">

.c-spinner {
  position: relative;
  background-color: white;
  width: 10px;
  height: 10px;
  margin: 0 auto;
  border-radius: 50%;
  // transition: initial
  
  &__two, &__one {
    // content: "";
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  
  &__two {
    left: -10px;
    top: -5px;
    background-color: white;
    transform-origin: 15px 10px;
    animation: axis 1s linear infinite;
  }
  &__one {
    left: -25px;
    top: -15px;
    background-color: white;
    transform-origin: 30px 20px;
    animation: axis 2s linear infinite;
  }
}

@keyframes axis {
  0% {
    transform: rotateZ(0deg) translate3d(0,0,0);
  }
  100% {
    transform: rotateZ(360deg) translate3d(0,0,0);
  }
}

</style>
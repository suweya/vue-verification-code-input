# vue-verification-code-input

> 🎉A verification code input

[![NPM](https://img.shields.io/npm/v/vue-verification-code-input.svg)](https://www.npmjs.com/package/vue-verification-code-input) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![NPM](https://nodei.co/npm/vue-verification-code-input.png)](https://nodei.co/npm/vue-verification-code-input/)

## Live demo

- [Demo](https://suweya.github.io/vue-verification-code-input/index.html)

## Install

```bash
npm install --save vue-verification-code-input
```

## Usage

```jsx
<template>
  <div id="app">
    <CodeInput :loading="false" class="input" v-on:change="onChange" v-on:complete="onComplete" />
  </div>
</template>

<script>
import CodeInput from "vue-verification-code-input";

export default {
  name: "app",
  components: {
    CodeInput
  },
  methods: {
    onChange(v) {
      console.log("onChange ", v);
    },
    onComplete(v) {
      console.log("onComplete ", v);
    }
  }
};
</script>
```

### Using component cleaning
You must create a variable and it must be boolean, additional you must create a method and it method must change the variable value because in the component CodeInput the clear prop has a watch event and it only is uptaded when the value is changed 
```jsx
<template>
  <div id="app">
    <CodeInput :loading="false" class="input" :clear="clear" :default-values="[8, 5, 6, 5, 4, 3]" />
  </div>
</template>

<script>
import CodeInput from "vue-verification-code-input";

export default {
  name: "app",
  data() {
    return {
      clear: false,
    };
  },
  components: {
    CodeInput
  },
  methods: {
    clearValues() {
      this.clear = !this.clear;
    }
  },
  mounted() {
    // Clear the component values after 5 seconds
    setTimeout(() => {
      this.clearValues()
    }, 5000)
  }
};
</script>
```

## PropTypes

|     Key     |  Type  |              Desc               |
| :---------: | :----: | :-----------------------------: |
|    type     |  text  |      one of number or text      |
|   fields    | number |     The count of characters     |
|  onChange   |  func  |   Trigger on character change   |
| onComplete  |  func  | Trigger on all character inputs |
| fieldWidth  | number |           input width           |
| fieldHeight | number |          input height           |
|  autoFocus  |  bool  | auto focus first input on init  |
|    title    | string |        code input title         |
|   loading   |  bool  |        show loading flag        |
|  className  | string |           class name            |
|    clear    |  bool  |  clear values with watch event  |
| defaultValues | array  |         default values        |

## License

MIT © [suweya](https://github.com/suweya)

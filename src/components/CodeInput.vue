<template>
  <div
    v-bind:class="{
      'react-code-input-container': true,
      [className]: !!className,
    }"
    v-bind:style="{ width: `${fields * fieldWidth}px` }"
  >
    <p class="title" v-if="title">{{ title }}</p>
    <div class="react-code-input">
      <template v-for="(v, index) in values">
        <input
          :type="type === 'number' ? 'tel' : type"
          :pattern="type === 'number' ? '[0-9]' : null"
          :autoFocus="autoFocus && !loading && index === autoFocusIndex"
          :style="{
            width: `${fieldWidth}px`,
            height: `${fieldHeight}px`,
          }"
          :key="`${id}-${index}`"
          :data-id="index"
          :value="v"
          :ref="iRefs[index]"
          v-on:input="onValueChange"
          v-on:focus="onFocus"
          v-on:keydown="onKeyDown"
          v-on:keyup="onKeyUp"
          :disabled="disabled"
          :required="required"
          @click="onClick"
        />
      </template>
    </div>
    <div
      v-if="loading"
      class="loading"
      :style="{ lineHeight: `${fieldHeight}px` }"
    >
      <div class="blur" />
      <svg
        class="spin"
        viewBox="0 0 1024 1024"
        data-icon="loading"
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill="#006fff"
          d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
        />
      </svg>
    </div>
  </div>
</template>

<script>
const KEY_CODE = {
  backspace: 8,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  ctrl: 17,
  cmd: 91,
  v: 86,
};

export default {
  name: "CodeInput",
  props: {
    type: {
      type: String,
      default: "number",
    },
    className: String,
    fields: {
      type: Number,
      default: 6,
    },
    fieldWidth: {
      type: Number,
      default: 58,
    },
    fieldHeight: {
      type: Number,
      default: 54,
    },
    autoFocus: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    title: String,
    change: Function,
    complete: Function,
    loading: {
      type: Boolean,
      default: false,
    },
    defaultValues: {
      type: Array,
      default: () => {
        return [];
      },
    },
    clear: Boolean,
  },
  data() {
    let { fields, defaultValues } = this;

    let vals;
    let autoFocusIndex = 0;
    if (defaultValues && defaultValues.length) {
      vals = [];
      for (let i = 0; i < fields; i++) {
        vals.push(defaultValues[i] || "");
      }
      autoFocusIndex =
        defaultValues.length >= fields ? 0 : defaultValues.length;
    } else {
      vals = Array(fields).fill("");
    }

    this.iRefs = [];
    for (let i = 0; i < fields; i++) {
      this.iRefs.push(`input_${i}`);
    }

    this.id = +new Date();

    return { values: vals, autoFocusIndex, ctrlDown: false, pasteCode: false };
  },
  mounted() {},
  methods: {
    onFocus(e) {
      e.target.select(e);
    },
    pasteAndSetCode(value) {
      let characters = value.slice();

      if (this.type == "number") {
        let numbers = [];
        for (let i = 0; i < value.length; i++) {
          if (characters[i].replace(/[^\d]/gi, "") != "") {
            numbers.push(characters[i]);
          }
        }

        characters = numbers;
      }

      if (characters.filter(character => character != "").length == 0) {
        return
      }

      this.emptyValues();

      this.values = this.values.map((value, index) => {
        value =
          typeof characters[index] != "undefined" ? characters[index] : "";

        this.changeValue(value, index, value != "");

        return value;
      });
    },
    changeValue(targetValue, index, valid, e = false) {
      index = parseInt(index);
      let inputValue = targetValue;
      let arrayValue = inputValue.slice();
      targetValue = typeof arrayValue[0] != "undefined" ? arrayValue[0] : "";

      if (e) {
        e.target.value = targetValue;
      }

      if (this.pasteCode) {
        this.pasteCode = false;

        if (index == 0) {
          this.pasteAndSetCode(inputValue);
        }
      }

      const { type, fields } = this;
      if (type === "number") {
        targetValue = targetValue.replace(/[^\d]/gi, "");

        if (e) {
          e.target.value = targetValue
        }
      }
      // this.handleKeys[index] = false;
      if (targetValue === "" || (type === "number" && !valid)) {
        return;
      }
      let next;
      const value = targetValue;
      let { values } = this;
      values = Object.assign([], values);
      if (value.length > 1 || (value.length > 0 && e)) {
        let nextIndex = value.length + index - 1 + (e ? 1 : 0);
        if (nextIndex >= fields) {
          nextIndex = fields - 1;
        }
        next = this.iRefs[nextIndex];
        const split = value.split("");
        split.forEach((item, i) => {
          const cursor = index + i;
          if (cursor < fields) {
            values[cursor] = item;
          }
        });
        this.values = values;
      } else {
        next = this.iRefs[index + 1];
        values[index] = value;
        this.values = values;
      }

      if (next) {
        this.selectAndFocusInput(next);
      }

      this.triggerChange(values);
    },
    selectAndFocusInput(index) {
      const element = this.$refs[index][0];
      element.focus();
      element.select();
    },
    onValueChange(e) {
      this.changeValue(
        e.target.value,
        e.target.dataset.id,
        e.target.validity.valid,
        e
      );
    },
    onClick(e) {
      this.selectAndFocusInput(this.iRefs[e.target.dataset.id])
    },
    onKeyUp(e) {
      if (e.keyCode == KEY_CODE.ctrl || e.keyCode == KEY_CODE.cmd) {
        this.ctrlDown = false;
      }
    },
    onKeyDown(e) {
      const index = parseInt(e.target.dataset.id);
      const prevIndex = index - 1;
      const nextIndex = index + 1;
      const prev = this.iRefs[prevIndex];
      const next = this.iRefs[nextIndex];

      if (e.keyCode == KEY_CODE.ctrl || e.keyCode == KEY_CODE.cmd) {
        this.ctrlDown = true;
      }

      switch (e.keyCode) {
        case KEY_CODE.backspace: {
          e.preventDefault();
          const vals = [...this.values];
          if (this.values[index]) {
            vals[index] = "";
            this.values = vals;
            this.triggerChange(vals);
          } else if (prev) {
            vals[prevIndex] = "";
            this.$refs[prev][0].focus();
            this.values = vals;
            this.triggerChange(vals);
          }
          break;
        }
        case KEY_CODE.left:
          e.preventDefault();
          if (prev) {
            this.$refs[prev][0].focus();
          }
          break;
        case KEY_CODE.right:
          e.preventDefault();
          if (next) {
            this.$refs[next][0].focus();
          }
          break;
        case KEY_CODE.up:
        case KEY_CODE.down:
          e.preventDefault();
          break;
        case KEY_CODE.v:
          this.pasteCode = true;
          break;
        default:
          // this.handleKeys[index] = true;
          break;
      }
    },
    triggerChange(values = this.values) {
      const { fields } = this;
      const val = values.join("");
      this.$emit("change", val);
      if (val.length >= fields) {
        this.$emit("complete", val);
      }
    },
    emptyValues() {
      this.values = Array(this.fields).fill("");
    },
    clearValues() {
      this.emptyValues();
      this.triggerChange();
    },
  },
  watch: {
    clear() {
      this.clearValues();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.react-code-input-container {
  position: relative;
}

.react-code-input > input {
  border: solid 1px #a8adb7;
  border-right: none;
  font-family: "Lato";
  font-size: 20px;
  color: #525461;
  text-align: center;
  box-sizing: border-box;
  border-radius: 0;
  -webkit-appearance: initial;
}

.react-code-input > input:last-child {
  border-right: solid 1px #a8adb7;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.react-code-input > input:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.react-code-input > input:focus {
  outline: none;
  border: 1px solid #006fff;
  caret-color: #006fff;
}

.react-code-input > input:focus + input {
  border-left: none;
}

.loading {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
}

.blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  opacity: 0.5;
  filter: blur(0.5px);
  transition: opacity 0.3s;
}

.title {
  margin: 0;
  height: 20px;
  padding-bottom: 10px;
}

.spin {
  display: inline-block;
  animation: loadingCircle 1s infinite linear;
}

@keyframes loadingCircle {
  100% {
    transform: rotate(360deg);
  }
}
</style>
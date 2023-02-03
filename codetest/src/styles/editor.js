import { BACKGROUND_COLOR, LINE_HEIGHT, FONT_SIZE } from './theme.js'
import { cssSupports } from '../utils/css-supports.js'

//const FONT_FAMILY = '"Roboto Mono", "Source Code Pro", Consolas, Menlo, monospace;'//`"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace`
//const FONT_FAMILY = `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace`
const FONT_FAMILY = `Consolas, Menlo, Courier, monospace`
const COLOR = (cssSupports('caret-color', '#F00')) ? BACKGROUND_COLOR : '#ccc'
const LINE_NUMBER_WIDTH = '40px'

export const editorCss = `
  .codeflask {
    -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select: none;
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .codeflask, .codeflask * {
    box-sizing: border-box;
    border: none;
    resize: none;
    outline: none;
  }

  .codeflask__pre {
    -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select: none; pointer-events:none;
    z-index: 3;
    transform:translate3d(0, 0, 0);
    box-sizing: border-box;
    white-space: pre;
    border: none;
    resize: none;
    outline: none;
    overflow: visible; !important;
  }

  .codeflask__textarea {

    background: none;
    //background:red;
    border: none;
    color: ${COLOR};
    color: rgba(0, 0, 0, 0);
    z-index: 1;
    resize: none;
    //font-family: ${FONT_FAMILY};
    //text-rendering: optimizeSpeed;
    //text-rendering: inherit;
    //-webkit-appearance: pre;
    caret-color: #fff;
    z-index: 2;
    width: 100%;
    height: 100%;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    border: none;
    outline: none;
    spellcheck:false;
    //overflow: hidden;
    overflow: scroll !important;

  }

  .codeflask--has-line-numbers .codeflask__textarea {
    width: calc(100% - ${LINE_NUMBER_WIDTH});
  }

  .codeflask__code {
    //padding: 10px;
    //background:black;
    display:block;
    font-size: ${FONT_SIZE};
    line-height: ${LINE_HEIGHT};
    font-family: ${FONT_FAMILY};
    //overflow: hidden;
    //overflow: scroll !important;
    //left:3px;
    //width: auto;
    //position: absolute;
    outline: none;
    resize: none;
    box-sizing: content-box;
    display: inline-block;
  }

  .codeflask__flatten {

    //background:grey;
    padding: 10px;
    font-size: ${FONT_SIZE};
    line-height: ${LINE_HEIGHT};
    font-family: ${FONT_FAMILY};
    text-rendering: optimizeLegibility;
    //letter-spacing: 1px;
    white-space: pre;
    word-wrap: normal;
    position: absolute;
    top: 0;
    left: 0;
    margin: 0 !important;
    outline: none;
    text-align: left;
    cursor:auto;
    outline: none;
    border-radius: 0;
    border-width: 0;
    background: transparent;
    //-webkit-background-clip: padding-box;
    background-clip: padding-box;
    resize: none;

  }

  .codeflask--has-line-numbers .codeflask__flatten {
    width: calc(100% - ${LINE_NUMBER_WIDTH});
    left: ${LINE_NUMBER_WIDTH};
    outline: none;
  }

  .codeflask__line-highlight {
    position: absolute;
    top: 10px;
    left: 0;
    width: 100%;
    height: ${LINE_HEIGHT};
    background: rgba(0,0,0,0.1);

    z-index: 1;
    //visibility: hidden;
    outline: none;
  }

  .codeflask__lines {
    padding: 10px 4px;
    font-size:  ${FONT_SIZE};
    line-height: ${LINE_HEIGHT};
    font-family: ${FONT_FAMILY};
    position: absolute;
    left: 0;
    top: 0;
    width: ${LINE_NUMBER_WIDTH};
    height: 100%;
    text-align: right;
    color: #90918b;
    z-index: 2;
    outline: none;
  }

  .codeflask__lines__line {
    display: block;
    outline: none;
  }

  .codeflask.codeflask--has-line-numbers {
    padding-left: ${LINE_NUMBER_WIDTH};
  }

  .codeflask.codeflask--has-line-numbers:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: ${LINE_NUMBER_WIDTH};
    height: 100%;
    //background: ${BACKGROUND_COLOR};
    z-index: 1;
    outline: none;
  }

  .codeflask__error {
    padding: 0px 0px;
    padding-right:4px;
    font-size:  ${FONT_SIZE};
    font-family: ${FONT_FAMILY};
    position: absolute;
    left: 0;
    width: ${LINE_NUMBER_WIDTH};
    height: ${LINE_HEIGHT};
    text-align: right;
    color: #FF0000;
    background:rgba(255,0,0,0.3);
    outline: none;
    z-index: 3;
    display:none;
  }
`
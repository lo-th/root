export const BACKGROUND_COLOR = '#282923';//'rgba(39, 40, 34, 1)'
export const LINE_HEIGHT = '19px'
export const FONT_SIZE = '15px'

export const defaultCssTheme = `
.codeflask {
  background: ${BACKGROUND_COLOR};
  //color: rgba(0, 0, 0, 0);
  color: #f8f8f2;
  //border-radius: 12px;
  //text-shadow: 1px 1px 1px black;
  //resize: true;
}

.codeflask ::-webkit-scrollbar {
  width: 15px;
  height:15px;
}

.codeflask ::-webkit-scrollbar-track {
  background:none;
  /*background-clip: content-box;*/
  
}

.codeflask ::-webkit-scrollbar-thumb {
  background-color: #555652; 
  width: 7px;
  //border-radius: 12px;
  border: 4px solid ${BACKGROUND_COLOR};
}

.codeflask ::-webkit-scrollbar-corner {
  background-color: rgba(0,0,0,0);
}



.codeflask ::selection {
  color: transparent;
  background-color: #47473d; //rgba(71, 71, 61, 0.5);
}

.codeflask ::-moz-selection{
  color: transparent;
  background-color: #47473d; //rgba(71, 71, 61, 0.5);
}


.codeflask .token.punctuation { color: #f8f8f2; /* white */ }

.codeflask .token.function { color: #67d8ef; /* blue */ } 
.codeflask .token.keyword { color: #67d8ef; font-style: italic; /* blue */ }

.codeflask .token.function-variable { color: #a6e22c; /* green */ }
.codeflask .token.class-name { color: #a6e22c; /* green */ }
.codeflask .token.function-extra { color: #a6e22c; /* green */ }

.codeflask .token.keyword-variable { color: #f92672; font-style: normal; /* red */ }
.codeflask .token.operator { color: #f92672; /* red */ }

.codeflask .token.parameter { color: #fd9621;/* orange */}
.codeflask .token.parameter-variable { color: #fd9621;/* orange */}

.codeflask .token.string { color: #e7db75; /* yellow */ }

.codeflask .token.comment { color: #75715e; /* grey */ }



.codeflask .token.boolean { color: #ae81ff; /* purple */ }
.codeflask .token.number { color: #ae81ff; /* purple */ }

.codeflask .token-template-string { color: #000000; }
.codeflask .token-class-name { color: #000000; }
.codeflask .token-regex { color: #000000; }

.codeflask .token.selector { color: #00FF00; }
.codeflask .token.property { color: #ac80ff;}
.codeflask .token.tag { color: #FFFF00; }
.codeflask .token.attr-value { color: #0000FF;}

`

/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FontPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  font: "None",
  force_mode: false,
  custom_css_mode: false,
  custom_css: ""
};
function get_default_css(font_family_name, css_class = ":root *") {
  return `${css_class} {
		--font-default: ${font_family_name};
		--default-font: ${font_family_name};
		--font-family-editor: ${font_family_name};
		--font-monospace-default: ${font_family_name},
		--font-interface-override: ${font_family_name},
		--font-text-override: ${font_family_name},
		--font-monospace-override: ${font_family_name},	
	}
`;
}
function get_custom_css(font_family_name, css_class = ":root *") {
  return `${css_class} * {
		font-family: ${font_family_name} !important;
		}`;
}
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function applyCss(css, css_id, appendMode = false) {
  const existingStyle = document.getElementById(css_id);
  if (existingStyle && appendMode) {
    existingStyle.innerHTML += css;
  } else {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    if (existingStyle) {
      existingStyle.remove();
    }
    style.id = css_id;
  }
}
var FontPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.config_dir = this.app.vault.configDir;
    this.plugin_folder_path = `${this.config_dir}/plugins/custom-font-loader`;
    this.font_folder_path = `${this.app.vault.configDir}/fonts`;
  }
  async load_plugin() {
    await this.loadSettings();
    try {
      const font_file_name = this.settings.font;
      if (font_file_name && font_file_name.toLowerCase() != "none") {
        if (font_file_name != "all") {
          await this.process_and_load_font(font_file_name, false);
        } else {
          applyCss("", "custom_font_base64");
          const files = await this.app.vault.adapter.list(this.font_folder_path);
          for (const file of files.files) {
            const file_name = file.split("/")[2];
            await this.process_and_load_font(file_name, true);
          }
        }
      } else {
        applyCss("", "custom_font_base64");
        applyCss("", "custom_font_general");
      }
    } catch (error) {
      new import_obsidian.Notice(error);
    }
  }
  async process_and_load_font(font_file_name, load_all_fonts) {
    console.log("loading %s", font_file_name);
    const css_font_path = `${this.plugin_folder_path}/${font_file_name.toLowerCase().replace(".", "_")}.css`;
    if (!await this.app.vault.adapter.exists(css_font_path)) {
      await this.convert_font_to_css(font_file_name, css_font_path);
    } else {
      await this.load_font(css_font_path, load_all_fonts);
      await this.load_css(font_file_name);
    }
  }
  async load_font(css_font_path, appendMode) {
    const content = await this.app.vault.adapter.read(css_font_path);
    applyCss(content, "custom_font_base64", appendMode);
  }
  async load_css(font_file_name) {
    let css_string = "";
    const font_family_name = font_file_name.split(".")[0];
    if (this.settings.custom_css_mode) {
      css_string = this.settings.custom_css;
    } else {
      css_string = get_default_css(font_family_name);
    }
    if (this.settings.force_mode)
      css_string += `
					* {
						font-family: ${font_family_name} !important;
					}
						`;
    applyCss(css_string, "custom_font_general");
  }
  async convert_font_to_css(font_file_name, css_font_path) {
    new import_obsidian.Notice("Processing Font files");
    const file = `${this.config_dir}/fonts/${font_file_name}`;
    const arrayBuffer = await this.app.vault.adapter.readBinary(file);
    const base64 = arrayBufferToBase64(arrayBuffer);
    const font_family_name = font_file_name.split(".")[0];
    const font_extension_name = font_file_name.split(".")[1];
    let css_type = "";
    switch (font_extension_name) {
      case "woff":
        css_type = "font/woff";
        break;
      case "ttf":
        css_type = "font/truetype";
        break;
      case "woff2":
        css_type = "font/woff2";
        break;
      case "otf":
        css_type = "font/opentype";
        break;
      default:
        css_type = "font";
    }
    const base64_css = `@font-face{
	font-family: '${font_family_name}';
	src: url(data:${css_type};base64,${base64});
}`;
    this.app.vault.adapter.write(css_font_path, base64_css);
    console.log("saved font %s into %s", font_family_name, css_font_path);
    console.log("Font CSS Saved into %s", css_font_path);
    await this.load_plugin();
  }
  async onload() {
    this.load_plugin();
    this.addSettingTab(new FontSettingTab(this.app, this));
  }
  async onunload() {
    applyCss("", "custom_font_base64");
    applyCss("", "custom_font_general");
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var FontSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async display() {
    const { containerEl } = this;
    containerEl.empty();
    const font_folder_path = `${this.app.vault.configDir}/fonts`;
    const infoContainer = containerEl.createDiv();
    infoContainer.setText("In Order to set the font, copy your font into '.obsidian/fonts/' directory.");
    const options = [{ name: "none", value: "None" }];
    try {
      if (!await this.app.vault.adapter.exists(font_folder_path)) {
        await this.app.vault.adapter.mkdir(font_folder_path);
      }
      if (await this.app.vault.adapter.exists(font_folder_path)) {
        const files = await this.app.vault.adapter.list(font_folder_path);
        for (const file of files.files) {
          const file_name = file.split("/")[2];
          options.push({ name: file_name, value: file_name });
        }
      }
      options.push({ name: "all", value: "Multiple fonts" });
    } catch (error) {
      console.log(error);
    }
    new import_obsidian.Setting(containerEl).setName("Font").setDesc("Choose font (If you choose multiple fonts option, we will load and process all fonts in the folder for you)").addDropdown((dropdown) => {
      for (const opt of options) {
        dropdown.addOption(opt.name, opt.value);
      }
      dropdown.setValue(this.plugin.settings.font).onChange(async (value) => {
        this.plugin.settings.font = value;
        await this.plugin.saveSettings();
        await this.plugin.load_plugin();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Force Style").setDesc("This option should only be used if you have installed a community theme and normal mode doesn't work").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.force_mode);
      toggle.onChange(async (value) => {
        this.plugin.settings.force_mode = value;
        await this.plugin.saveSettings();
        await this.plugin.load_plugin();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Custom CSS Mode").setDesc("If you want to apply a custom css style rather than default style, choose this.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.custom_css_mode);
      toggle.onChange(async (value) => {
        if (this.plugin.settings.custom_css_mode == false) {
          this.plugin.settings.custom_css = "";
        }
        this.plugin.settings.custom_css_mode = value;
        this.plugin.saveSettings();
        this.plugin.load_plugin();
        this.display();
      });
    });
    if (this.plugin.settings.custom_css_mode) {
      new import_obsidian.Setting(containerEl).setName("Custom CSS Style").setDesc("Input your custom css style").addTextArea(async (text) => {
        text.onChange(
          async (new_value) => {
            this.plugin.settings.custom_css = new_value;
            await this.plugin.saveSettings();
            await this.plugin.load_plugin();
          }
        );
        text.setDisabled(!this.plugin.settings.custom_css_mode);
        if (this.plugin.settings.custom_css == "") {
          let font_family_name = "";
          try {
            font_family_name = this.plugin.settings.font.split(".")[0];
          } catch (error) {
            console.log(error);
          }
          if (font_family_name == "all") {
            if (await this.app.vault.adapter.exists(font_folder_path)) {
              const files = await this.app.vault.adapter.list(font_folder_path);
              let final_str = "";
              for (const file of files.files) {
                const file_name = file.split("/")[2];
                const font_family = file_name.split(".")[0];
                final_str += "\n" + get_custom_css(font_family, "." + font_family);
              }
              text.setValue(final_str);
            }
          } else {
            text.setValue(get_default_css(font_family_name));
          }
        } else {
          text.setValue(this.plugin.settings.custom_css);
        }
        text.onChanged();
        text.inputEl.style.width = "100%";
        text.inputEl.style.height = "100px";
      });
    }
  }
};

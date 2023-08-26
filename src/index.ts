import { Plugin, Dialog, openTab } from "siyuan";
//import svgEdit from "@/libs/svg-edit.svelte";
import SavePanel from "@/save.svelte";

export default class siyuanPluginSvgBlockEdit extends Plugin {
  private blockIconEventBindThis = this.blockIconEvent.bind(this);

  //private blockId: BlockId;
  async onload() {
    console.log(this.i18n.helloPlugin);
  }

  onLayoutReady() {
    this.eventBus.on("click-blockicon", this.blockIconEventBindThis);
    //console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  onunload() {
    this.eventBus.off("click-blockicon", this.blockIconEventBindThis);
    console.log(this.i18n.byePlugin);
  }
  private blockIconEvent({ detail }: any) {
    //console.log(detail);
    if (detail.blockElements.length > 1) {
      return;
    }
    const ele = detail.blockElements[0] as HTMLElement;
    if (ele.getAttribute("data-type") !== "NodeHTMLBlock") {
      return;
    }
    const protyleELe = ele.querySelector("protyle-html");
    const html = protyleELe.getAttribute("data-content");
    let tempEle = document.createElement("div");
    tempEle.innerHTML = html;
    const svgEle = tempEle.querySelector("svg");
    //console.log(html);
    if (!svgEle && html) {
      return;
    }

    const blockId = ele.getAttribute("data-node-id");

    const loadEditor = this.loadEditor.bind(this);
    detail.menu.addItem({
      label: this.i18n.editSVG,
      async click() {
        loadEditor(blockId);
      },
    });
  }
  private loadEditor(blockId: BlockId) {
    //console.log(html);
    //const height = 540;
    //const width = 700;
    const content = `<iframe id="siyuanPlugin-svgBlockEdit" src="./plugins/siyuanPlugin-svgBlockEdit/libs/editor/index.html"
                        targetId='${blockId}'>
                    </iframe>`;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        //console.log(entry);
        const height = entry.contentRect.height;
        const width = entry.contentRect.width;
        const iframe = document.getElementById("siyuanPlugin-svgBlockEdit");
        try {
          iframe.style.height = `${height * 0.9}px`;
          iframe.style.width = `${width}px`;
        } catch (e) {
          return;
        }
      }
    });
    const tab = openTab({
      app: this.app,
      custom: {
        icon: "iconFace",
        title: "svg编辑器",
        data: {
          text: "",
        },
        fn: this.addTab({
          type: "custom_tab",
          init() {
            const thisElement = this.element as HTMLElement;
            thisElement.innerHTML = content;
            resizeObserver.observe(thisElement); //?是否有副作用,resize
            /*function resize() {
              console.log("resize");
              const width = window.getComputedStyle(thisElement).width;
              const height = window.getComputedStyle(thisElement).height;
              const iframe = thisElement.querySelector("iframe");
              iframe.style.height = `${parseInt(height) * 0.9}px`;
              iframe.style.width = width;
            }*/
          },
          beforeDestroy() {
            let dialog = new Dialog({
              title: "svg编辑器",
              transparent: false,
              width: "420px",
              content: `<div id="savePanel" class="b3-dialog__content"></div>`,
              height: "200px",
            });

            const iframe = this.element.querySelector(
              "iframe"
            ) as HTMLIFrameElement;
            try {
              const svgEditor = iframe.contentWindow.svgEditor;
              const { svgCanvas } = svgEditor;
              const svgcontent = svgCanvas.svgCanvasToString();
              //console.log(svgcontent);
              /*const svgcontent =
                iframe.contentDocument.getElementById("svgcontent");*/
              //console.log(iframe);
              new SavePanel({
                target: dialog.element.querySelector("#savePanel"),
                props: {
                  blockId: blockId,
                  svgHtml: svgcontent,
                  dialog: dialog,
                },
              });
            } catch (e) {
              return;
            }

            //console.log("before destroy tab:");
          },
          destroy() {
            resizeObserver.disconnect();
            //console.log("destroy tab:");
          },
        }),
      },
    });
  }
}

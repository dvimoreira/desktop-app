'use strict'

import { app, protocol, BrowserWindow, shell, ipcMain, ipcRenderer } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const {PosPrinter} = require("@3ksy/electron-pos-printer");
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.setMenu(null)
  win.maximize()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  ipcMain.handle("get-printers-list", async () => {
    async function sh() {
      return new Promise(function(resolve, reject) {
        exec("wmic printer list brief", (err, stdout, stderr) => {
          if (err) {
            reject(err);
            return;
          }
          stdout = stdout.split("  ");
          var printers = [];
          let j = 0;
          stdout = stdout.filter((item) => item);
          for (let i = 0; i < stdout.length; i++) {
            if (stdout[i] == " \r\r\n" || stdout[i] == "\r\r\n") {
              printers[j] = stdout[i + 1];
              j++;
            }
          }
          resolve({ printers, stdout });
        });
      });
    }
    let data = await sh();
    return data;
  });

  ipcMain.handle('print-data-order', async (event, ...args) => {
    const newData = args;
    let dataPrint = JSON.parse(newData);
    let getPrinterData = JSON.parse(dataPrint.printer);
    let result = dataPrint.item;

    const options = {
      preview: false,
      margin: "0 10px 0 10px",
      copies: 1,
      printerName: getPrinterData.impressora,
      printBackground: true,
      timeOutPerLine: 400,
      pageSize: getPrinterData.largura + "mm",
      silent: true
    }

    let data = [
      {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Pedido ' + result.codigo_pedido,
          style: {fontWeight: "700", textAlign: 'center', fontSize: "20px", marginBottom: "40px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Cliente: ' + result.cli_name,
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Telefone: ' + result.phone,
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: (result.tipo_pedido === 'delivery') ? 'Tipo de pedido: Entrega' : 'Tipo de pedido: Comer na Praça',
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: (result.payment_type === 'money') ? 'Forma de Pagamento: Dinheiro' : 'Forma de Pagamento: Cartão',
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Troco para: R$ ' + result.troco,
        style: {fontWeight: "400", textAlign: 'left', borderBottom: "1px solid #000000", paddingBottom: "15px", marginBottom: "30px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Taxa de Entrega: R$ ' + result.total_frete,
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Valor do Pedido: R$ ' + result.total_pedido,
        style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
      },
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Valor Total: R$ ' + result.total_soma,
        style: {fontWeight: "400", textAlign: 'left', borderBottom: "1px solid #000000", paddingBottom: "15px", marginBottom: "30px", fontSize: "16px"}
      }
    ]

    if (result.tipo_pedido === 'delivery') {
      data.push(
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Endereço: ' + result.rua,
          style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Bairro: ' + result.bairro,
          style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'Complemento: ' + result.complemento,
          style: {fontWeight: "400", textAlign: 'left', marginBottom: "5px", fontSize: "16px"}
        },
        {
          type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: 'CEP: ' + result.cep,
          style: {fontWeight: "400", textAlign: 'left', borderBottom: "1px solid #000000", paddingBottom: "15px", marginBottom: "30px", fontSize: "16px"}
        }
      )
    }

    let itensCardapio = JSON.parse(result.pedido_itens)
    let carrinho = []

    itensCardapio.forEach(item => {
      let cartTemp = []
      cartTemp.push(item.item)
      cartTemp.push(item.qtd)
      cartTemp.push(item.price)
      carrinho.push(cartTemp)
    });

    data.push(
      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Observação: ' + result.observacao,
        style: {fontWeight: "600", textAlign: 'left', borderBottom: "1px solid #000000", paddingBottom: "15px", marginBottom: "30px", fontSize: "16px"}
      },

      {
        type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
        value: 'Itens do pedido: ',
        style: {fontWeight: "700", textAlign: 'left', marginBottom: "5px", fontSize: "20px"}
      },

      {
        type: 'table',
        // style the table
        style: {border: '1px solid #000000'},
        // list of the columns to be rendered in the table header
        tableHeader: ['Item', 'Qtd', 'Total'],
        // multi dimensional array depicting the rows and columns of the table body
        tableBody: carrinho,
        // custom style for the table body
        // list of columns to be rendered in the table footer
        tableFooter: ['Item', 'Qtd', 'Total'],
        // custom style for the table header
        tableHeaderStyle: { color: '#000000'},
        // custom style for the table body
        tableBodyStyle: {'border': '2px solid #00000'},
        // custom style for the table footer
        tableFooterStyle: {color: '#000000'},
      }
    )

    PosPrinter.print(data, options)
      .then(console.log)
      .catch((error) => {
        console.error(error);
      });
  })

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

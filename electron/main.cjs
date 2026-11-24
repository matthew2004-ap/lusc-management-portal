const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 940, minWidth: 1024, minHeight: 700,
    title: "LUSC Management Portal",
    backgroundColor: "#f4f7fb",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  const url = process.env.LUSC_APP_URL || "http://localhost:3000";
  win.loadURL(url);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

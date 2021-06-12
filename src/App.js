import React, { useEffect, useState } from 'react';
import './App.css';
import ThreeImporter from './ThreeImporter';
import * as bimU from 'bimu.io.viewer';

function App() {
  const THREE = window.THREE;
  const [currentModel, setCurrentModel] = useState({});
  const [websocketConnection, setWebsocketConnection] = useState(undefined);
  const [isWebsocketConnected, setIsWebsocketConnected] = useState(false);

  let addCameraPosition = (viewer, text, position, description, options) => {
    let location = new THREE.Vector3(position.x, -position.z, 1.5);//position.y);
    viewer.addTag(text, location, options, () => {
      viewer.showDialog("Information", `You clicked <strong>${description}</strong>`, "Close", null, null, true);
    });
  }

  useEffect(() => {
    // Viewer configuration object
    let viewerConfigs = {
      domElementId: "viewer",
      showUI: true
    };
    let currentModelId;

    // Initialise a Viewer 
    let viewer = new bimU.Viewer(viewerConfigs);
    viewer.initialize();

    //temp axis
    viewer.addTag(" 0 ", new THREE.Vector3(0, 0, 0), {backgroundColor: {r: 0, g: 0, b: 0, a: 1 }});
    viewer.addTag("x", new THREE.Vector3(0.5, 0, 0), {backgroundColor: {r: 255, g: 0, b: 0, a: 1 }});
    viewer.addTag(" x ", new THREE.Vector3(1, 0, 0), {backgroundColor: {r: 255, g: 0, b: 0, a: 1 }});
    viewer.addTag("x", new THREE.Vector3(1.5, 0, 0), {backgroundColor: {r: 255, g: 0, b: 0, a: 1 }});
    viewer.addTag(" x ", new THREE.Vector3(2, 0, 0), {backgroundColor: {r: 255, g: 0, b: 0, a: 1 }});
    viewer.addTag("y", new THREE.Vector3(0, 0.5, 0), {backgroundColor: {r: 0, g: 255, b: 0, a: 1 }});
    viewer.addTag(" y ", new THREE.Vector3(0, 1, 0), {backgroundColor: {r: 0, g: 255, b: 0, a: 1 }});
    viewer.addTag("y", new THREE.Vector3(0, 1.5, 0), {backgroundColor: {r: 0, g: 255, b: 0, a: 1 }});
    viewer.addTag(" y ", new THREE.Vector3(0, 2, 0), {backgroundColor: {r: 0, g: 255, b: 0, a: 1 }});
    viewer.addTag("z", new THREE.Vector3(0, 0, 0.5), {backgroundColor: {r: 0, g: 0, b: 255, a: 1 }});
    viewer.addTag(" z ", new THREE.Vector3(0, 0, 1), {backgroundColor: {r: 0, g: 0, b: 255, a: 1 }});
    viewer.addTag("z", new THREE.Vector3(0, 0, 1.5), {backgroundColor: {r: 0, g: 0, b: 255, a: 1 }});
    viewer.addTag(" z ", new THREE.Vector3(0, 0, 2), {backgroundColor: {r: 0, g: 0, b: 255, a: 1 }});



    const onPorgress = (e) => { // Callback that reports model loading progress.
      console.log(e);
      viewer.showDialog("Loading...", `<div style="color: black;"> Progress: ${e.progress} </div>`, "Close", null, null, true);
    };
    const onLoaded = (e) => { // Callback when model is fully loaded.
      console.log(e);
      viewer.closeDialog();
      viewer.alignToView('top');
      let wsConnect = new WebSocket(`wss://gbcrwksd0d.execute-api.us-east-1.amazonaws.com/dev${"/?mid=" + currentModelId}&device=2`); //1: mobile, 2: receiver
      wsConnect.onopen = (e) => {
        console.log("Connected to websocket.");
        wsConnect.send(JSON.stringify({ message: `Receiver connected.`, modelId: currentModelId }));
        wsConnect.onmessage = (e) => {
          console.log(e);
          let data = JSON.parse(e.data);
          let modelId = data.modelId;
          let position = data.position;
          if(position){
            addCameraPosition(viewer, "0", position, "point");
          }
        };
        setIsWebsocketConnected(true);
        setWebsocketConnection(wsConnect);
      };
    };
    const onError = (e) => console.log(e); // Callback when model fails to load.

    viewer.showDialog("Connect to a model",
      `<div>
        <label for="label_model_id" style="color: black;" >MD:</label>
        <input type="text" id="modelId" name="modelId" value="608c15ffa23cf40004e9bd74"><br><br>
        <label for="label_password" style="color: black;" >PW:</label>
        <input type="password" id="modelPassword" name="password" value="1234"><br><br>
      </div>`
      , null, "Load", () => {
        let modelId = document.getElementById('modelId').value || "608c15ffa23cf40004e9bd74";
        let password = document.getElementById('modelPassword').value || "1234";
        let modelConfigs = { 					// Model configuration object
          modelId: modelId,
          password: password,
          //accessToken: "YOUR_ACCESS_TOKEN"
        };
        setCurrentModel({ modelId: modelId });
        currentModelId = modelId; //Some functions cannot wait state change
        viewer.loadModel(modelConfigs, onPorgress, onLoaded, onError); // Load a model
      }, true);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">
          AR Camera Receiver Example
        </h1>
        <div id="viewer" className="viewer-container"></div>
      </header>
    </div>
  );
}

export default App;

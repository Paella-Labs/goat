import axios from "axios";
import * as fs from "fs";
import { x25519 } from "@noble/curves/ed25519";
import { fileURLToPath } from "url";

const CLOUD_API_URL = "https://cloud-api.phala.network";
const CLOUD_URL = "https://cloud.phala.network";

interface Env {
  key: string;
  value: string;
}

interface GetPubkeyResponse {
  app_env_encrypt_pubkey: string;
  app_id_salt: string;
}

interface CreateCvmResponse {
  app_id: string;
  app_url: string;
}

async function encryptSecrets(secrets: Record<string, string>, pubkey: string): Promise<string> {
  const envsJson = JSON.stringify({ env: Object.entries(secrets).map(([key, value]) => ({ key, value })) });

  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);

  const remotePubkey = new Uint8Array(Buffer.from(pubkey, 'hex'));
  const shared = x25519.getSharedSecret(privateKey, remotePubkey);

  const importedShared = await crypto.subtle.importKey(
    "raw",
    shared,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    importedShared,
    new TextEncoder().encode(envsJson)
  );

  const result = new Uint8Array(publicKey.length + iv.length + encrypted.byteLength);
  result.set(publicKey);
  result.set(iv, publicKey.length);
  result.set(new Uint8Array(encrypted), publicKey.length + iv.length);

  return Buffer.from(result).toString('hex');
}

export async function quickStartPhalaDeployment(
  apiKey: string,
  composeFilePath: string,
  deployName: string,
  envVars: Record<string, string>
): Promise<void> {
  const composeString = fs.readFileSync(composeFilePath, "utf8");
  const vm_config = {
    teepod_id: 2,
    name: deployName,
    image: "dstack-dev-0.3.4",
    vcpu: 1,
    memory: 2048,
    disk_size: 20,
    compose_manifest: {
      docker_compose_file: composeString,
      docker_config: {
        url: "",
        username: "",
        password: ""
      },
      features: ["kms", "tproxy-net"],
      kms_enabled: true,
      manifest_version: 2,
      name: deployName,
      public_logs: true,
      public_sysinfo: true,
      tproxy_enabled: true
    },
    listed: false
  };

  const pubkeyRes = await axios.post(
    `${CLOUD_API_URL}/api/v1/cvms/pubkey/from_cvm_configuration`,
    vm_config,
    { headers: { "X-API-Key": apiKey, "Content-Type": "application/json" } }
  );
  const { app_env_encrypt_pubkey, app_id_salt } = pubkeyRes.data as GetPubkeyResponse;

  const encrypted_env = await encryptSecrets(envVars, app_env_encrypt_pubkey);

  const createResponse = await axios.post(
    `${CLOUD_API_URL}/api/v1/cvms/from_cvm_configuration`,
    {
      ...vm_config,
      app_env_encrypt_pubkey,
      app_id_salt,
      encrypted_env
    },
    { headers: { "X-API-Key": apiKey, "Content-Type": "application/json" } }
  );
  
  const response = createResponse.data as CreateCvmResponse;
  console.log("Deployment successful");
  console.log("App Id:", response.app_id);
  console.log("App URL:", `${CLOUD_URL}/dashboard/cvms/app_${response.app_id}`);
}

// Example usage
async function main() {
  const apiKey = process.env.PHALA_API_KEY;
  if (!apiKey) {
    console.error("Please set PHALA_API_KEY environment variable");
    process.exit(1);
  }

  const composeContent = `
version: '3'
services:
  app:
    image: nginx:latest
    ports:
      - "80:80"
  `;
  
  const tempComposePath = "/tmp/demo-compose.yml";
  fs.writeFileSync(tempComposePath, composeContent);

  quickStartPhalaDeployment(
    apiKey,
    tempComposePath,
    "demo-deployment",
    {
      NGINX_HOST: "localhost",
      NGINX_PORT: "80"
    }
  ).catch(console.error)
    .finally(() => {
      fs.unlinkSync(tempComposePath);
    });
}

// Run the main function
main().catch(console.error);

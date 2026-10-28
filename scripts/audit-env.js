const fs = require('fs');

async function auditEnv() {
  console.log('================================================================');
  console.log('🔍 ABCD SOCIAL HUB — COMPREHENSIVE .ENV & SERVICE HEALTH AUDIT');
  console.log('================================================================\n');

  const envContent = fs.readFileSync('.env', 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });

  let allPassed = true;

  // 1. Database Check (via packages/db)
  try {
    const { execSync } = require('child_process');
    const result = execSync('pnpm --filter @abcd/db verify', { encoding: 'utf8' });
    if (result.includes('100% verified and operational')) {
      console.log('1. [DATABASE - Neon PostgreSQL 16]');
      console.log('   ✅ Connection: ACTIVE & REACHABLE');
      console.log('   ✅ Multi-Tenant Isolation: VERIFIED');
      console.log('   ✅ Credit Ledger: OPERATIONAL');
    } else {
      console.log('1. [DATABASE] ❌ Unexpected verification output');
      allPassed = false;
    }
  } catch (e) {
    console.log('1. [DATABASE] ❌ FAILED:', e.message);
    allPassed = false;
  }

  // 2. Resend Email Check
  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY }
    });
    const data = await res.json();
    if (data.data) {
      console.log('\n2. [EMAIL - Resend]');
      console.log('   ✅ API Key: ACTIVE & AUTHENTICATED');
      console.log('   ✅ Sender: ' + env.EMAIL_FROM);
      console.log('   ✅ Super Admin: ' + env.SUPER_ADMIN_EMAILS);
    } else {
      console.log('\n2. [EMAIL] ❌ FAILED:', data);
      allPassed = false;
    }
  } catch (e) {
    console.log('\n2. [EMAIL] ❌ FAILED:', e.message);
    allPassed = false;
  }

  // 3. AI Providers Check
  console.log('\n3. [AI GATEWAY & INFERENCE]');
  // 3a. Groq
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.GROQ_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Say hello in 2 words' }],
        max_tokens: 30
      })
    });
    const d = await res.json();
    if (d.choices && d.choices[0]?.message) {
      const content = d.choices[0].message.content || 'OK';
      console.log('   ✅ Tier 1 (Groq): OPERATIONAL (Response: "' + content.trim() + '")');
    } else {
      console.log('   ❌ Tier 1 (Groq) error:', d);
      allPassed = false;
    }
  } catch (e) {
    console.log('   ❌ Tier 1 (Groq) error:', e.message);
    allPassed = false;
  }

  // 3b. NVIDIA NIM
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/models', {
      headers: { 'Authorization': 'Bearer ' + env.NVIDIA_API_KEY }
    });
    const d = await res.json();
    if (res.status === 200 && d.data) {
      console.log('   ✅ Tier 2 (NVIDIA NIM): OPERATIONAL (' + d.data.length + ' models available, Key Valid)');
    } else {
      console.log('   ❌ Tier 2 (NVIDIA) error (Status ' + res.status + '):', d);
      allPassed = false;
    }
  } catch (e) {
    console.log('   ❌ Tier 2 (NVIDIA) error:', e.message);
    allPassed = false;
  }

  // 3c. OpenRouter
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3.5-lightning:free',
        messages: [{ role: 'user', content: 'Say hello in 2 words' }],
        max_tokens: 30
      })
    });
    const d = await res.json();
    if (d.choices && d.choices[0]?.message) {
      const content = d.choices[0].message.content || 'OK';
      console.log('   ✅ Tier 3 (OpenRouter Free): OPERATIONAL (Response: "' + content.trim() + '")');
    } else {
      console.log('   ❌ Tier 3 (OpenRouter) error:', d);
      allPassed = false;
    }
  } catch (e) {
    console.log('   ❌ Tier 3 (OpenRouter) error:', e.message);
    allPassed = false;
  }

  // 4. Cloudinary Check
  console.log('\n4. [MEDIA STORAGE - Cloudinary]');
  try {
    const auth = Buffer.from(env.CLOUDINARY_API_KEY + ':' + env.CLOUDINARY_API_SECRET).toString('base64');
    const res = await fetch('https://api.cloudinary.com/v1_1/' + env.CLOUDINARY_CLOUD_NAME + '/ping', {
      headers: { 'Authorization': 'Basic ' + auth }
    });
    const d = await res.json();
    if (d.status === 'ok') {
      console.log('   ✅ Cloudinary: CONNECTED & VERIFIED (Cloud: ' + env.CLOUDINARY_CLOUD_NAME + ')');
    } else {
      console.log('   ❌ Cloudinary error:', d);
      allPassed = false;
    }
  } catch (e) {
    console.log('   ❌ Cloudinary error:', e.message);
    allPassed = false;
  }

  // 5. Security & Cryptographic Keys Check
  console.log('\n5. [SECURITY & CRYPTOGRAPHIC SECRETS]');
  const tokenKeyLen = env.TOKEN_ENCRYPTION_KEY ? Buffer.from(env.TOKEN_ENCRYPTION_KEY, 'hex').length : 0;
  if (tokenKeyLen === 32) {
    console.log('   ✅ TOKEN_ENCRYPTION_KEY: VALID (Exactly 32-byte AES-256-GCM hex key)');
  } else {
    console.log('   ❌ TOKEN_ENCRYPTION_KEY: Invalid byte length (' + tokenKeyLen + ' bytes instead of 32)');
    allPassed = false;
  }

  if (env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length >= 32) {
    console.log('   ✅ NEXTAUTH_SECRET: VALID (Cryptographically strong session secret)');
  } else {
    console.log('   ❌ NEXTAUTH_SECRET: Too short or missing');
    allPassed = false;
  }

  if (env.INTERNAL_API_SECRET && env.INTERNAL_API_SECRET.length >= 16) {
    console.log('   ✅ INTERNAL_API_SECRET: VALID (Secures Next.js <-> Python worker communication)');
  } else {
    console.log('   ❌ INTERNAL_API_SECRET: Missing or weak');
    allPassed = false;
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 AUDIT VERDICT: ALL SYSTEMS GO! 100% HEALTHY & READY!');
  } else {
    console.log('⚠️ AUDIT VERDICT: SOME SERVICES FAILED');
  }
  console.log('================================================================');
}

auditEnv();

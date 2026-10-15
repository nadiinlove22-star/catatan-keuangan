(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const cfg=window.FINANCE_CONFIG||{};let db=null;const st={user:null,mode:'login',page:'home',kind:'expense',accounts:[],categories:[],transactions:[],settings:{},selectedDate:iso(new Date()),cal:new Date(),filter:'all',subtab:'hari',viewMonth:month()};function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}function month(){return iso(new Date()).slice(0,7)}function money(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0)}function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function date(s){return s?new Date(s+'T12:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):''}function msg(el,s,err=false){el.textContent=s;el.classList.toggle('error',err)}function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.tm);toast.tm=setTimeout(()=>t.classList.remove('show'),2400)}function appVisible(on){$('#auth-screen').classList.toggle('hidden',on);$('#app').classList.toggle('hidden',!on)}async function auth(){if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseKey){msg($('#auth-message'),'Supabase belum dikonfigurasi. Periksa config.js.',true);return}db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){st.user=null;appVisible(false)}else if(session&&session.user.id!==st.user?.id){st.user=session.user;setTimeout(load,0)}});const {data,error}=await db.auth.getSession();if(error)throw error;if(data.session){st.user=data.session.user;await load();appVisible(true)}else appVisible(false)}function balance(a){return Number(a.opening_balance||0)+st.transactions.reduce((n,t)=>{if(t.kind==='transfer'){if(t.account_id===a.id)n-=+t.amount;if(t.to_account_id===a.id)n+=+t.amount}else if(t.account_id===a.id)n+=(t.kind==='income'?1:-1)*Number(t.amount);return n},0)}function sum(arr,k){return arr.filter(t=>t.kind===k).reduce((n,t)=>n+Number(t.amount),0)}function empty(s){return '<div class="empty">'+s+'</div>'}function row(t){const a=st.accounts.find(a=>a.id===t.account_id),c=st.categories.find(c=>c.id===t.category_id),sign=t.kind==='income'?'+':t.kind==='expense'?'−':'';return '<button class="list-row" data-edit="'+t.id+'"><span class="row-icon">'+(t.kind==='income'?'↙':t.kind==='transfer'?'⇄':'↗')+'</span><span class="row-main"><span class="row-title">'+esc(t.title)+'</span><span class="row-sub">'+esc(c?.name||(t.kind==='transfer'?'Transfer':'Tanpa kategori'))+' · '+esc(a?.name||'Akun')+' · '+date(t.transaction_date)+'</span></span><span class="row-amount '+(t.kind==='income'?'green-text':t.kind==='expense'?'red-text':'')+'">'+sign+money(t.amount)+'</span></button>'}function render(){const m=st.transactions.filter(t=>t.transaction_date?.startsWith(month()));$('#total-balance').textContent=money(st.accounts.reduce((n,a)=>n+balance(a),0));$('#month-income').textContent=money(sum(m,'income'));$('#month-expense').textContent=money(sum(m,'expense'));$('#recent-list').innerHTML=st.transactions.slice(0,5).map(row).join('')||empty('Belum ada transaksi. Tambahkan transaksi pertamamu.');renderTx();renderReference();renderStats();renderAccounts();renderCal();renderSettings();fillOptions()}function renderReference(){const vm=st.viewMonth||month(),arr=st.transactions.filter(t=>t.transaction_date?.startsWith(vm)),inc=sum(arr,'income'),exp=sum(arr,'expense');const label=new Date(vm+'-01T12:00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'});$('#tx-month-label').textContent=label;$('#daily-income').textContent=money(inc);$('#daily-expense').textContent=money(exp);$('#daily-total').textContent=money(inc-exp);$('#monthly-label').textContent=label;$('#monthly-income').textContent=money(inc);$('#monthly-expense').textContent=money(exp);$('#monthly-total').textContent=money(inc-exp);$('#monthly-list').innerHTML=arr.map(row).join('')||empty('Belum ada transaksi pada bulan ini.');$('#close-income').textContent=money(inc);$('#close-expense').textContent=money(exp);$('#close-total').textContent=money(inc-exp);$$('[data-subtab]').forEach(b=>b.classList.toggle('active',b.dataset.subtab===st.subtab));$$('[data-subtab-view]').forEach(v=>v.classList.toggle('hidden',v.dataset.subtabView!==st.subtab));$('#transaction-heading').textContent=({hari:'Transaksi',kalender:'Kalender',bulanan:'Bulanan',tutup:'Tutup buku',menu:'Menu'})[st.subtab]||'Transaksi';}
function renderTx(){const q=$('#transaction-search').value.toLowerCase(),m=$('#transaction-month').value;const arr=st.transactions.filter(t=>(st.filter==='all'||t.kind===st.filter)&&(!m||t.transaction_date?.startsWith(m))&&(!q||(t.title+' '+(t.note||'')).toLowerCase().includes(q)));const groups={};arr.forEach(t=>(groups[t.transaction_date]??=[]).push(t));$('#transaction-list').innerHTML=Object.entries(groups).sort((a,b)=>b[0].localeCompare(a[0])).map(([day,items])=>{const income=sum(items,'income'),expense=sum(items,'expense');return '<div class="day-group"><div class="day-group-head"><strong>'+date(day)+'</strong><span><b class="blue-text">'+money(income)+'</b> <b class="red-text">'+money(expense)+'</b></span></div>'+items.map(row).join('')+'</div>'}).join('')||empty('Tidak ada transaksi yang cocok.')}function renderStats(){const m=$('#stats-month').value||month(),a=st.transactions.filter(t=>t.transaction_date?.startsWith(m.slice(0,7))),inc=sum(a,'income'),exp=sum(a,'expense');$('#stats-income').textContent=money(inc);$('#stats-expense').textContent=money(exp);$('#stats-net').textContent=money(inc-exp);const max=Math.max(inc,exp,1);$('#income-bar').style.width=inc/max*100+'%';$('#expense-bar').style.width=exp/max*100+'%';const cats={};a.filter(t=>t.kind==='expense').forEach(t=>{const name=st.categories.find(c=>c.id===t.category_id)?.name||'Lainnya';cats[name]=(cats[name]||0)+Number(t.amount)});const en=Object.entries(cats).sort((x,y)=>y[1]-x[1]),total=en.reduce((n,x)=>n+x[1],0)||1,palette=['#ff625e','#f5a142','#f4d35e','#81c784','#55b9c7','#7aaeff','#ad8be8','#e78ac3','#a4a6ae'];let deg=0;const stops=en.map(([n,v],i)=>{const a=deg;deg+=v/total*360;return palette[i%palette.length]+' '+a+'deg '+deg+'deg'});$('#category-pie').style.background=en.length?'conic-gradient('+stops.join(',')+')':'var(--surface2)';$('#category-pie-legend').innerHTML=en.slice(0,6).map(([n,v],i)=>'<div><i style="background:'+palette[i%palette.length]+'"></i><span>'+esc(n)+'</span><strong>'+Math.round(v/total*100)+'%</strong></div>').join('');$('#category-stats').innerHTML=en.map(([n,v],i)=>'<div class="category-stat"><div class="category-stat-head"><span><i class="mini-dot" style="background:'+palette[i%palette.length]+'"></i>'+esc(n)+'</span><strong>'+money(v)+'</strong></div><div class="bar-track"><div class="bar red-bar" style="width:'+(v/total*100)+'%;background:'+palette[i%palette.length]+'"></div></div></div>').join('')||empty('Belum ada pengeluaran bulan ini.');}function renderAccounts(){const liabilities=st.accounts.filter(a=>a.account_type==='credit').reduce((n,a)=>n+Math.abs(balance(a)),0),assets=st.accounts.filter(a=>a.account_type!=='credit').reduce((n,a)=>n+balance(a),0);$('#asset-total').textContent=money(assets);$('#liability-total').textContent=money(liabilities);$('#net-assets').textContent=money(assets-liabilities);$('#account-list').innerHTML=st.accounts.map(a=>'<div class="list-row"><span class="row-icon">'+(a.account_type==='credit'?'↗':a.account_type==='investment'?'◈':'▣')+'</span><span class="row-main"><span class="row-title">'+esc(a.name)+'</span><span class="row-sub">'+esc(({cash:'Tunai',bank:'Bank',ewallet:'Dompet digital',investment:'Investasi',credit:'Liabilitas',other:'Lainnya'})[a.account_type]||a.account_type)+' · Saldo awal '+money(a.opening_balance)+'</span></span><span class="row-amount '+(a.account_type==='credit'?'red-text':'')+'">'+money(balance(a))+'</span></div>').join('')||empty('Belum ada akun.')}function renderSettings(){$('#display-name').value=st.settings.display_name||'';$('#category-list').innerHTML=st.categories.filter(c=>c.user_id===st.user?.id).map(c=>'<span class="chip">'+esc(c.name)+' <button data-del-cat="'+c.id+'">×</button></span>').join('')||'<span class="muted">Kategori pribadi belum ditambahkan.</span>'}function fillOptions(){const opts=st.accounts.map(a=>'<option value="'+a.id+'">'+esc(a.name)+'</option>').join('');$('#transaction-account').innerHTML=opts;$('#transaction-to-account').innerHTML=opts;$('#transaction-category').innerHTML='<option value="">Tanpa kategori</option>'+st.categories.filter(c=>c.kind===st.kind).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');const months=[...new Set([month(),...st.transactions.map(t=>t.transaction_date.slice(0,7))])].sort().reverse();for(const id of ['transaction-month','stats-month']){const el=$('#'+id),old=el.value||month();el.innerHTML='<option value="">Semua bulan</option>'+months.map(m=>'<option value="'+m+'">'+new Date(m+'-01T12:00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'})+'</option>').join('');if(id==='stats-month')el.innerHTML=months.map(m=>'<option value="'+m+'">'+new Date(m+'-01T12:00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'})+'</option>').join('');if([...el.options].some(o=>o.value===old))el.value=old}}function renderCal(){const d=st.cal,y=d.getFullYear(),m=d.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);$('#calendar-label').textContent=d.toLocaleDateString('id-ID',{month:'long',year:'numeric'});let h=['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(x=>'<span class="weekday">'+x+'</span>').join('');for(let i=0;i<first.getDay();i++)h+='<span></span>';for(let day=1;day<=last.getDate();day++){const key=iso(new Date(y,m,day)),has=st.transactions.some(t=>t.transaction_date===key);h+='<button data-day="'+key+'" class="'+(key===st.selectedDate?'selected ':'')+(has?'has-transactions':'')+'">'+day+'</button>'}$('#calendar-grid').innerHTML=h;$('#calendar-day-label').textContent='Transaksi · '+date(st.selectedDate);$('#calendar-list').innerHTML=st.transactions.filter(t=>t.transaction_date===st.selectedDate).map(row).join('')||empty('Tidak ada transaksi tanggal ini.')}function go(p){st.page=p;$$('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+p));$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===p));window.scrollTo(0,0)}function setKind(k){st.kind=k;$$('[data-form-kind]').forEach(b=>b.classList.toggle('active',b.dataset.formKind===k));$('#to-account-wrap').classList.toggle('hidden',k!=='transfer');$('#category-wrap').classList.toggle('hidden',k==='transfer');fillOptions()}function openTx(t){$('#transaction-form').reset();$('#transaction-id').value=t?.id||'';$('#transaction-title').value=t?.title||'';$('#transaction-amount').value=t?.amount||'';$('#transaction-note').value=t?.note||'';$('#transaction-date').value=t?.transaction_date||iso(new Date());$('#transaction-account').value=t?.account_id||st.accounts[0]?.id||'';$('#transaction-to-account').value=t?.to_account_id||st.accounts[1]?.id||'';$('#transaction-dialog-title').textContent=t?'Edit transaksi':'Tambah transaksi';$('#delete-transaction').classList.toggle('hidden',!t);setKind(t?.kind||'expense');if(t?.category_id)$('#transaction-category').value=t.category_id;$('#transaction-dialog').showModal()}async function saveTx(e){e.preventDefault();const id=$('#transaction-id').value,k=st.kind,account=$('#transaction-account').value,to=$('#transaction-to-account').value,amount=Number($('#transaction-amount').value);if(k==='transfer'&&(!to||to===account)){msg($('#transaction-message'),'Pilih akun tujuan yang berbeda.',true);return}const v={user_id:st.user.id,kind:k,account_id:account,to_account_id:k==='transfer'?to:null,category_id:k==='transfer'?null:($('#transaction-category').value||null),title:$('#transaction-title').value.trim(),amount,transaction_date:$('#transaction-date').value,note:$('#transaction-note').value.trim()};if(!v.title||amount<=0)return;$('#save-transaction').disabled=true;try{const r=id?await db.from('finance_transactions').update(v).eq('id',id).eq('user_id',st.user.id):await db.from('finance_transactions').insert(v);if(r.error)throw r.error;$('#transaction-dialog').close();await load();toast(id?'Transaksi diperbarui':'Transaksi tersimpan')}catch(e){msg($('#transaction-message'),e.message,true)}finally{$('#save-transaction').disabled=false}}async function addAccount(e){e.preventDefault();const r=await db.from('finance_accounts').insert({user_id:st.user.id,name:$('#account-name').value.trim(),account_type:$('#account-type').value,opening_balance:Number($('#account-opening').value)||0});if(r.error){msg($('#account-message'),r.error.message,true);return}$('#account-dialog').close();$('#account-form').reset();await load();toast('Akun ditambahkan')}async function addCat(e){e.preventDefault();const r=await db.from('finance_categories').insert({user_id:st.user.id,name:$('#category-name').value.trim(),kind:$('#category-kind').value});if(r.error){toast(r.error.message);return}$('#category-name').value='';await load()}async function delCat(id){if(!confirm('Hapus kategori?'))return;const r=await db.from('finance_categories').delete().eq('id',id).eq('user_id',st.user.id);if(r.error){toast(r.error.message);return}await load()}async function saveProfile(){const name=$('#display-name').value.trim(),r=await db.from('finance_settings').upsert({user_id:st.user.id,display_name:name,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(r.error){msg($('#settings-message'),r.error.message,true);return}st.settings.display_name=name;msg($('#settings-message'),'Profil tersimpan.');$('#greeting').textContent=name?'Halo, '+name:'Ringkasan'}let sqlJsPromise=null;function getSqlJs(){if(!sqlJsPromise)sqlJsPromise=(async()=>{if(!window.initSqlJs){await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';s.onload=ok;s.onerror=()=>no(Error('Pustaka pembaca SQLite tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.'));document.head.appendChild(s)})}return window.initSqlJs({locateFile:f=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/'+f})})();return sqlJsPromise}
function snapshot(){if(!st.user)return;const snap={format:'catatan-keuangan-local-v1',saved_at:new Date().toISOString(),user_id:st.user.id,accounts:st.accounts,categories:st.categories.filter(x=>x.user_id===st.user.id||st.transactions.some(t=>t.category_id===x.id)),transactions:st.transactions,settings:st.settings};const textData=JSON.stringify(snap);try{localStorage.setItem('finance-backup:'+st.user.id,textData);$('#offline-backup-status').textContent='Backup lokal otomatis terakhir: '+new Date().toLocaleString('id-ID')}catch(e){console.warn('Local storage backup failed',e)}try{const req=indexedDB.open('catatan-keuangan-offline',1);req.onupgradeneeded=()=>req.result.createObjectStore('snapshots',{keyPath:'user_id'});req.onsuccess=()=>{const dbx=req.result,tx=dbx.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(snap);tx.oncomplete=()=>dbx.close()}}catch(e){console.warn('IndexedDB backup failed',e)}}
async function offlineBackup(){try{const SQL=await getSqlJs(),d=new SQL.Database();d.run('CREATE TABLE ASSETS (uid TEXT, NIC_NAME TEXT, opening_balance REAL, account_type TEXT); CREATE TABLE ZCATEGORY (uid TEXT, NAME TEXT, TYPE INTEGER); CREATE TABLE INOUTCOME (uid TEXT, assetUid TEXT, ctgUid TEXT, ZCONTENT TEXT, ZDATE TEXT, DO_TYPE TEXT, ZMONEY TEXT, IN_ZMONEY TEXT, AMOUNT_ACCOUNT REAL, toAssetUid TEXT, ZDATA TEXT, IS_DEL INTEGER); CREATE TABLE BACKUP_META (format TEXT, exported_at TEXT);');const accountUid=new Map();st.accounts.forEach((a,i)=>{const uid='acc-'+(a.id||i);accountUid.set(a.id,uid);d.run('INSERT INTO ASSETS VALUES (?,?,?,?)',[uid,a.name,Number(a.opening_balance)||0,a.account_type])});st.categories.filter(x=>x.user_id===st.user.id||st.transactions.some(t=>t.category_id===x.id)).forEach((x,i)=>d.run('INSERT INTO ZCATEGORY VALUES (?,?,?)',['cat-'+(x.id||i),x.name,x.kind==='income'?0:1]));const catUid=new Map(st.categories.map((x,i)=>[x.id,'cat-'+(x.id||i)]));st.transactions.forEach((t,i)=>{const typ=t.kind==='income'?'1':t.kind==='transfer'?'3':'0';d.run('INSERT INTO INOUTCOME VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',['tx-'+(t.id||i),accountUid.get(t.account_id)||'',catUid.get(t.category_id)||'',t.title,t.transaction_date,typ,String(t.amount),String(t.amount),Number(t.amount),accountUid.get(t.to_account_id)||'',t.note||'',0])});d.run('INSERT INTO BACKUP_META VALUES (?,?)',['catatan-keuangan-offline-v1',new Date().toISOString()]);const bytes=d.export(),blob=new Blob([bytes],{type:'application/vnd.sqlite3'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='Catatan-Keuangan-'+iso(new Date())+'.mmbak';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);msg($('#backup-message'),'Backup offline SQLite berhasil dibuat.')}catch(e){msg($('#backup-message'),e.message,true)}}
async function importMmbak(file){
 const SQL=await getSqlJs(),buf=new Uint8Array(await file.arrayBuffer()),d=new SQL.Database(buf);
 try{
  const tables=d.exec("SELECT name FROM sqlite_master WHERE type='table'"),names=new Set((tables[0]?.values||[]).map(r=>String(r[0]).toUpperCase()));
  if(!names.has('INOUTCOME')||!names.has('ASSETS')||!names.has('ZCATEGORY'))throw Error('File SQLite tidak berisi tabel ASSETS, ZCATEGORY, dan INOUTCOME yang diperlukan.');
  const read=n=>{if(!names.has(n))return[];const out=d.exec('SELECT * FROM "'+n+'"');if(!out.length)return[];return out[0].values.map(vals=>Object.fromEntries(out[0].columns.map((k,i)=>[k.toUpperCase(),vals[i]])))};
  const oldAssets=read('ASSETS').filter(a=>a.NIC_NAME!==null&&String(a.NIC_NAME).trim()!==''),oldCats=read('ZCATEGORY').filter(c=>c.NAME!==null&&String(c.NAME).trim()!==''&&String(c.C_IS_DEL??'0')!=='1'),oldTx=read('INOUTCOME').filter(t=>String(t.IS_DEL??0)!=='1');
  if(!oldAssets.length)throw Error('Backup tidak memiliki akun yang dapat dipulihkan.');
  const accountMap=new Map(),catMap=new Map(),accountPayloads=[],categoryPayloads=[],transactionPayloads=[];
  const putKeys=(map,row,id)=>{map.set(String(row.UID??row.ID),id);map.set(String(row.ID),id)};
  for(const a of oldAssets){
   const name=String(a.NIC_NAME).trim();
   let type=['cash','bank','ewallet','investment','credit','other'].includes(String(a.ACCOUNT_TYPE??''))?String(a.ACCOUNT_TYPE):'other';
   if(!a.ACCOUNT_TYPE){const n=name.toLowerCase();if(n==='tunai')type='cash';else if(/bank|bri|jago|seabank/i.test(n))type='bank';else if(/dana|ovo|gopay|shopeepay|wallet/i.test(n))type='ewallet';else if(/kartu|kredit/i.test(n))type='credit'}
   const opening=Number(a.OPENING_BALANCE??0);
   accountPayloads.push({source:a,payload:{user_id:st.user.id,name,account_type:type,opening_balance:Number.isFinite(opening)?opening:0}});
  }
  for(const c of oldCats){
   const name=String(c.NAME).trim();
   if(name.length>60)throw Error('Nama kategori melebihi batas aplikasi: '+name);
   categoryPayloads.push({source:c,payload:{user_id:st.user.id,name,kind:Number(c.TYPE)===0?'income':'expense'}});
  }
  const parsedDate=v=>{
   if(v===null||v===undefined||v==='')return null;const s=String(v);let dt;
   if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s)){const [y,m,day]=s.split('-').map(Number);dt=new Date(y,m-1,day,12);if(dt.getFullYear()!==y||dt.getMonth()!==m-1||dt.getDate()!==day)return null}
   else if(/^\\d{10,13}$/.test(s)){const n=Number(s);dt=new Date(s.length<=10?n*1000:n)}
   else dt=new Date(s);
   if(!Number.isFinite(dt.getTime()))return null;
   return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0')
  };
  const moneyValue=t=>{for(const v of [t.AMOUNT_ACCOUNT,t.IN_ZMONEY,t.ZMONEY])if(v!==null&&v!==undefined&&v!==''){const n=Number(v);if(Number.isFinite(n))return Math.abs(n)}return NaN};
  const transferGroups=new Map();
  for(const t of oldTx){const typ=String(t.DO_TYPE??'0');if(!['0','1','3','4','7'].includes(typ))throw Error('Jenis transaksi sumber tidak dikenali (AID '+String(t.AID)+', DO_TYPE '+typ+'). Tidak ada data yang diimpor.');if(typ==='3'||typ==='4'){const key=String(t.TXUIDTRANS??'');if(!key)throw Error('Transfer tanpa ID pasangan ditemukan (AID '+String(t.AID)+'). Tidak ada data yang diimpor.');if(!transferGroups.has(key))transferGroups.set(key,[]);transferGroups.get(key).push(t)}}
  for(const [key,group] of transferGroups){const counts=group.reduce((m,t)=>(m[String(t.DO_TYPE)]=(m[String(t.DO_TYPE)]||0)+1,m),{});if(!(group.length===1&&counts['3']===1)&&!(group.length===2&&counts['3']===1&&counts['4']===1))throw Error('Pasangan transfer tidak lengkap atau duplikat ('+key+'). Tidak ada data yang diimpor.')}
  const sourceAccountKeys=new Set();for(const a of oldAssets){sourceAccountKeys.add(String(a.UID??a.ID));sourceAccountKeys.add(String(a.ID))}
  const sourceCategoryKeys=new Set();for(const c of oldCats){sourceCategoryKeys.add(String(c.UID??c.ID));sourceCategoryKeys.add(String(c.ID))}
  for(const t of oldTx){
   const typ=String(t.DO_TYPE??'0');if(typ==='4')continue;
   const transactionDate=parsedDate(t.WDATE)||parsedDate(t.ZDATE),amount=moneyValue(t);
   if(!transactionDate||!Number.isFinite(amount)||amount<=0)throw Error('Tanggal atau nominal transaksi sumber AID '+String(t.AID)+' tidak valid. Tidak ada data yang diimpor.');
   const accountKey=String(t.ASSETUID??''),accountKey2=String(t.ASSETID??'');
   if(!sourceAccountKeys.has(accountKey)&&!sourceAccountKeys.has(accountKey2))throw Error('Akun sumber transaksi AID '+String(t.AID)+' tidak ditemukan di file backup.');
   const kind=typ==='1'?'income':typ==='3'?'transfer':'expense';
   if(kind==='transfer'&&!sourceAccountKeys.has(String(t.TOASSETUID??'')))throw Error('Akun tujuan transfer AID '+String(t.AID)+' tidak ditemukan di file backup.');
   if(kind!=='transfer'&&t.CTGUID!==null&&t.CTGUID!==undefined&&String(t.CTGUID)!==''&&String(t.CTGUID)!=='-4'&&!sourceCategoryKeys.has(String(t.CTGUID)))throw Error('Kategori transaksi AID '+String(t.AID)+' tidak ditemukan di file backup.');
   const title=String(t.ZCONTENT??'').trim()||String(t.CATEGORY_NAME??'').trim()||'Transaksi impor';
   const sourceNote=String(t.ZDATA??'').trim();
   const note=typ==='7'?'Penyesuaian saldo dari backup lama (DO_TYPE=7)'+(sourceNote?' — '+sourceNote:''):(sourceNote||null);
   transactionPayloads.push({source:t,payload:{user_id:st.user.id,kind,account_source:accountKey,account_source_alt:accountKey2,to_source:String(t.TOASSETUID??''),category_source:String(t.CTGUID??''),title,amount,transaction_date:transactionDate,note}});
  }
  if(!confirm('Validasi backup berhasil: '+oldAssets.length+' akun, '+oldCats.length+' kategori aktif, '+oldTx.length+' baris transaksi sumber ('+transactionPayloads.length+' transaksi aplikasi; baris pasangan transfer akan digabung). Impor akan menambahkan data dan tidak menghapus data saat ini. Lanjutkan?'))return;
  for(const item of accountPayloads){const r=await db.from('finance_accounts').insert(item.payload).select('id').single();if(r.error)throw Error('Gagal menyimpan akun "'+item.payload.name+'": '+r.error.message);putKeys(accountMap,item.source,r.data.id)}
  for(const item of categoryPayloads){const r=await db.from('finance_categories').insert(item.payload).select('id').single();if(r.error)throw Error('Gagal menyimpan kategori "'+item.payload.name+'": '+r.error.message);putKeys(catMap,item.source,r.data.id)}
  for(let i=0;i<transactionPayloads.length;i++){
   const item=transactionPayloads[i],p=item.payload,accountId=accountMap.get(p.account_source)||accountMap.get(p.account_source_alt),to=p.kind==='transfer'?accountMap.get(p.to_source):null,categoryId=p.kind==='transfer'?null:(catMap.get(p.category_source)||null);
   if(!accountId||p.kind==='transfer'&&!to)throw Error('Pemetaan akun gagal untuk transaksi sumber AID '+String(item.source.AID)+'.');
   const {account_source,account_source_alt,to_source,category_source,...payload}=p;payload.account_id=accountId;payload.to_account_id=to||null;payload.category_id=categoryId;
   const r=await db.from('finance_transactions').insert(payload);
   if(r.error)throw Error('Gagal menyimpan transaksi sumber AID '+String(item.source.AID)+': '+r.error.message+'. Sebagian data mungkin sudah tersimpan; jangan ulangi impor sebelum memeriksa data.');
  }
  await load();
  msg($('#backup-message'),'Impor selesai: '+oldAssets.length+' akun, '+oldCats.length+' kategori, '+transactionPayloads.length+' transaksi aplikasi dari '+oldTx.length+' baris sumber. Pasangan transfer digabung tanpa menghilangkan nominal.');
 }finally{d.close()}
}
async function restore(file){
 if(!file)return;
 try{
  const ext=file.name.toLowerCase();
  if(ext.endsWith('.mmbak')||ext.endsWith('.sqlite')||ext.endsWith('.db')){
   if(!confirm('Pulihkan backup SQLite? Akun, kategori, dan transaksi dari file akan ditambahkan. Pastikan file benar dan buat backup data saat ini terlebih dahulu.'))return;
   await importMmbak(file);return;
  }
  const d=JSON.parse(await file.text());
  if(!['catatan-keuangan-backup-v1','catatan-keuangan-local-v1'].includes(d.format))throw Error('Format JSON backup tidak dikenal.');
  const accounts=Array.isArray(d.accounts)?d.accounts:[],categories=Array.isArray(d.categories)?d.categories:[],transactions=Array.isArray(d.transactions)?d.transactions:[];
  if(!accounts.length)throw Error('Backup tidak memiliki akun. Tidak ada data yang diubah.');
  const accountIds=new Set(accounts.map(a=>String(a.id)));
  const categoryIds=new Set(categories.map(c=>String(c.id)));
  for(const a of accounts)if(!String(a.name||'').trim())throw Error('Backup memiliki akun tanpa nama. Tidak ada data yang diubah.');
  for(const c of categories)if(!String(c.name||'').trim()||!['income','expense'].includes(c.kind))throw Error('Backup memiliki kategori yang tidak valid. Tidak ada data yang diubah.');
  for(const t of transactions){
   if(!['income','expense','transfer'].includes(t.kind)||!String(t.title||'').trim()||!Number.isFinite(Number(t.amount))||Number(t.amount)<=0||!/^\d{4}-\d{2}-\d{2}$/.test(String(t.transaction_date||'')))throw Error('Backup memiliki transaksi yang tidak valid (nama, jenis, tanggal, atau nominal). Tidak ada data yang diubah.');
   if(!accountIds.has(String(t.account_id))||(t.to_account_id&&!accountIds.has(String(t.to_account_id))))throw Error('Backup memiliki transaksi yang menunjuk akun yang tidak tersedia. Tidak ada data yang diubah.');
   if(t.category_id&&!categoryIds.has(String(t.category_id))&&t.kind!=='transfer')throw Error('Backup memiliki transaksi yang menunjuk kategori yang tidak tersedia. Tidak ada data yang diubah.');
  }
  if(!confirm('Validasi awal berhasil: '+accounts.length+' akun, '+categories.length+' kategori, '+transactions.length+' transaksi. Data akan ditambahkan ke akun ini dan tidak menggantikan data yang sudah ada. Lanjutkan?'))return;
  const accountMap=new Map(),categoryMap=new Map();
  for(const a of accounts){
   const r=await db.from('finance_accounts').insert({user_id:st.user.id,name:String(a.name).trim(),account_type:['cash','bank','ewallet','investment','credit','other'].includes(a.account_type)?a.account_type:'other',opening_balance:Number(a.opening_balance)||0}).select('id').single();
   if(r.error)throw Error('Gagal menyimpan akun "'+a.name+'": '+r.error.message);
   accountMap.set(String(a.id),r.data.id);
  }
  for(const c of categories){
   const payload={user_id:st.user.id,name:String(c.name).trim(),kind:c.kind};
   if(c.icon)payload.icon=String(c.icon).slice(0,40);
   const r=await db.from('finance_categories').insert(payload).select('id').single();
   if(r.error)throw Error('Gagal menyimpan kategori "'+c.name+'": '+r.error.message);
   categoryMap.set(String(c.id),r.data.id);
  }
  for(let i=0;i<transactions.length;i++){
   const t=transactions[i],payload={user_id:st.user.id,kind:t.kind,account_id:accountMap.get(String(t.account_id)),to_account_id:t.to_account_id?accountMap.get(String(t.to_account_id)):null,category_id:t.kind==='transfer'?null:(t.category_id?categoryMap.get(String(t.category_id)):null),title:String(t.title).trim(),amount:Number(t.amount),transaction_date:t.transaction_date,note:t.note==null?'':String(t.note)};
   const r=await db.from('finance_transactions').insert(payload);
   if(r.error)throw Error('Gagal menyimpan transaksi '+(i+1)+' dari '+transactions.length+': '+r.error.message+' Data sebelumnya mungkin sudah tersimpan; jangan ulangi restore sebelum memeriksa data.');
  }
  if(d.settings&&typeof d.settings==='object'){
   const settingsPayload={user_id:st.user.id,display_name:String(d.settings.display_name||''),updated_at:new Date().toISOString()};
   const sr=await db.from('finance_settings').upsert(settingsPayload,{onConflict:'user_id'});
   if(sr.error)throw Error('Data utama berhasil diimpor, tetapi pengaturan gagal dipulihkan: '+sr.error.message);
  }
  await load();
  msg($('#backup-message'),'Pemulihan selesai: '+accounts.length+' akun, '+categories.length+' kategori, '+transactions.length+' transaksi.');
 }catch(e){console.error('Restore error',e);msg($('#backup-message'),e.message||'Pemulihan gagal.',true)}
 finally{$('#restore-file').value=''}
}
async function backup(){const data={format:'catatan-keuangan-backup-v1',exported_at:new Date().toISOString(),accounts:st.accounts,categories:st.categories.filter(c=>c.user_id===st.user.id||st.transactions.some(t=>t.category_id===c.id)),transactions:st.transactions,settings:st.settings},u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='catatan-keuangan-'+iso(new Date())+'.json';a.click();URL.revokeObjectURL(u);msg($('#backup-message'),'Backup diunduh.')}
function appVisible(on){$('#auth-screen').classList.toggle('hidden',on);$('#app').classList.toggle('hidden',!on)}
function bind(){
 const form=$('#auth-form');
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=$('#auth-submit'),email=$('#auth-email').value.trim(),password=$('#auth-password').value;
  btn.disabled=true;btn.textContent=st.mode==='signup'?'Membuat akun…':'Memeriksa…';msg($('#auth-message'),'');
  try{
   if(!db)db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
   const result=st.mode==='signup'?await db.auth.signUp({email,password}):await db.auth.signInWithPassword({email,password});
   if(result.error)throw result.error;
   if(st.mode==='signup'&&!result.data.session){msg($('#auth-message'),'Akun berhasil dibuat. Periksa email untuk konfirmasi, lalu masuk.');return}
   if(!result.data.session)throw Error('Login belum menghasilkan sesi. Periksa konfirmasi email atau coba masuk kembali.');
   st.user=result.data.user;
   appVisible(true);go('transactions');
   const ok=await load();
   if(!ok)toast('Login berhasil, tetapi data belum termuat. Periksa koneksi/database lalu muat ulang.');
  }catch(err){console.error('Auth error',err);msg($('#auth-message'),err.message||'Login gagal. Periksa koneksi dan kredensial.',true)}
  finally{btn.disabled=false;btn.textContent=st.mode==='signup'?'Daftar':'Masuk'}
 });
 $$('[data-auth-mode]').forEach(b=>b.addEventListener('click',()=>{st.mode=b.dataset.authMode;$$('[data-auth-mode]').forEach(x=>x.classList.toggle('active',x===b));$('#auth-submit').textContent=st.mode==='signup'?'Daftar':'Masuk';$('#auth-password').autocomplete=st.mode==='signup'?'new-password':'current-password';msg($('#auth-message'),'')}));
 const signOut=async()=>{if(!db)return;const {error}=await db.auth.signOut();if(error)toast('Gagal keluar: '+error.message)};
 $('#logout').addEventListener('click',signOut);$('#logout-settings').addEventListener('click',signOut);
 $('#transaction-form').addEventListener('submit',saveTx);$('#add-account').addEventListener('click',()=>$('#account-dialog').showModal());$('#account-form').addEventListener('submit',addAccount);$('#category-form').addEventListener('submit',addCat);$('#save-settings').addEventListener('click',saveProfile);$('#backup').addEventListener('click',backup);$('#backup-offline').addEventListener('click',offlineBackup);$('#restore-file').addEventListener('change',e=>restore(e.target.files?.[0]));
 $('#add-transaction').addEventListener('click',()=>openTx());$('#quick-add').addEventListener('click',()=>openTx());$('#transaction-search').addEventListener('input',renderTx);$('#transaction-month').addEventListener('change',renderTx);$('#stats-month').addEventListener('change',renderStats);
 $$('[data-form-kind]').forEach(b=>b.addEventListener('click',()=>setKind(b.dataset.formKind)));$$('[data-kind-filter]').forEach(b=>b.addEventListener('click',()=>{st.filter=b.dataset.kindFilter;$$('[data-kind-filter]').forEach(x=>x.classList.toggle('active',x===b));renderTx()}));
 $$('[data-go]').forEach(b=>b.addEventListener('click',()=>{const page=b.dataset.go==='calendar'?'transactions':b.dataset.go;go(page);if(b.dataset.go==='calendar'){st.subtab='kalender';renderReference()}}));$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
 $$('[data-subtab]').forEach(b=>b.addEventListener('click',()=>{st.subtab=b.dataset.subtab;renderReference()}));
 document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close)$('#'+close.dataset.close).close();
  const edit=e.target.closest('[data-edit]');if(edit){const t=st.transactions.find(x=>x.id===edit.dataset.edit);if(t)openTx(t)}
  const del=e.target.closest('[data-del-cat]');if(del)delCat(del.dataset.delCat);
  if(e.target.closest('#delete-transaction')){const id=$('#transaction-id').value;if(id&&confirm('Hapus transaksi ini?'))db.from('finance_transactions').delete().eq('id',id).eq('user_id',st.user.id).then(async r=>{if(r.error)msg($('#transaction-message'),r.error.message,true);else{$('#transaction-dialog').close();await load();toast('Transaksi dihapus')}})}
 });
 ['prev-month','next-month','tx-prev-month','tx-next-month','monthly-prev','monthly-next'].forEach(id=>$('#'+id)?.addEventListener('click',()=>{const delta=id.includes('prev')?-1:1;if(id.startsWith('tx-')||id.startsWith('monthly-')){const d=new Date((st.viewMonth||month())+'-01T12:00:00');d.setMonth(d.getMonth()+delta);st.viewMonth=iso(d).slice(0,7);renderReference()}else{st.cal.setMonth(st.cal.getMonth()+delta);renderCal()}}));
 $('#export-month').addEventListener('click',()=>{
  const m=st.viewMonth||month(),rows=st.transactions.filter(t=>t.transaction_date?.startsWith(m));
  const csv=[['Tanggal','Jenis','Transaksi','Nominal','Akun','Akun tujuan','Kategori','Catatan'],...rows.map(t=>[t.transaction_date,t.kind,t.title,t.amount,st.accounts.find(a=>a.id===t.account_id)?.name||'',st.accounts.find(a=>a.id===t.to_account_id)?.name||'',st.categories.find(c=>c.id===t.category_id)?.name||'',t.note||''])];
  const content=csv.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),u=URL.createObjectURL(new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='ringkasan-'+m+'.csv';a.click();URL.revokeObjectURL(u);msg($('#close-message'),'CSV periode '+m+' berhasil dibuat.')
 });
}
async function init(){
 if(!cfg.supabaseUrl||!cfg.supabaseKey||!window.supabase){msg($('#auth-message'),'Supabase belum dikonfigurasi. Periksa config.js dan koneksi internet.',true);return}
 try{
  db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
  bind();
  db.auth.onAuthStateChange((event)=>{
   if(event==='SIGNED_OUT'){st.user=null;st.accounts=[];st.categories=[];st.transactions=[];st.settings={};appVisible(false)}
  });
  const {data,error}=await db.auth.getSession();if(error)throw error;
  if(data.session){st.user=data.session.user;appVisible(true);go('transactions');await load()}else appVisible(false);
  $('#connection-status').textContent='Terhubung ke layanan autentikasi.';
 }catch(e){console.error('Init error',e);msg($('#auth-message'),'Aplikasi gagal diinisialisasi: '+(e.message||'kesalahan koneksi'),true);$('#connection-status').textContent='Koneksi gagal: '+e.message}
}
async function load(){
 if(!st.user||!db)return false;
 try{
  const id=st.user.id;
  const [a,c,t,s]=await Promise.all([
   db.from('finance_accounts').select('*').eq('user_id',id).order('created_at'),
   db.from('finance_categories').select('*').or('user_id.eq.'+id+',user_id.is.null').order('name'),
   db.from('finance_transactions').select('*').eq('user_id',id).order('transaction_date',{ascending:false}).order('created_at',{ascending:false}),
   db.from('finance_settings').select('*').eq('user_id',id).maybeSingle()
  ]);
  for(const r of [a,c,t,s])if(r.error)throw r.error;
  st.accounts=a.data||[];st.categories=c.data||[];st.transactions=t.data||[];st.settings=s.data||{};
  if(!st.accounts.length){
   const r=await db.from('finance_accounts').insert({user_id:id,name:'Tunai',account_type:'cash',opening_balance:0}).select().single();
   if(r.error)throw r.error;st.accounts=[r.data];
  }
  render();snapshot();$('#connection-status').textContent='Data tersinkron dengan Supabase.';return true;
 }catch(e){console.error('Load error',e);$('#connection-status').textContent='Gagal memuat data: '+e.message;toast('Gagal memuat data: '+e.message);return false}
}
init();
})();
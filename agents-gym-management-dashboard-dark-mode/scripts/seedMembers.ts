import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Function to load .env.local file if process.env isn't fully loaded
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
  ]

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      content.split('\n').forEach((line) => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...values] = trimmed.split('=')
          const val = values.join('=').replace(/^["']|["']$/g, '').trim()
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = val
          }
        }
      })
    }
  }
}

loadEnv()

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ajfpbzuhtxqqmgmgmcxn.supabase.co'

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface RawMemberRecord {
  member_id: string
  name: string
  password?: string
}

// Fallback embedded member list
const embeddedMembers: RawMemberRecord[] = [
  { member_id: 'MEM001', name: 'TECHRO.LK', password: '111111' },
  { member_id: 'MEM002', name: 'HASANKA', password: '111111' },
  { member_id: 'MEM003', name: 'IMAN NIMSARA', password: '111111' },
  { member_id: 'MEM005', name: 'DILHANI', password: '111111' },
  { member_id: 'MEM011', name: 'CHATHURANGA IHALAGEDARA', password: '111111' },
  { member_id: 'MEM013', name: 'AMMAR', password: '111111' },
  { member_id: 'MEM014', name: 'SUPUN GIHAN', password: '111111' },
  { member_id: 'MEM015', name: 'DILSHAN MADUSARA', password: '111111' },
  { member_id: 'MEM016', name: 'METHDUNU CHAMOD', password: '111111' },
  { member_id: 'MEM017', name: 'CHANILA LAKSHAN', password: '111111' },
  { member_id: 'MEM018', name: 'RIDAN', password: '111111' },
  { member_id: 'MEM019', name: 'JAYANTHA KUMAR', password: '111111' },
  { member_id: 'MEM020', name: 'SUMITH PRIYANTHA', password: '111111' },
  { member_id: 'MEM021', name: 'VIHANGA DILHARA', password: '111111' },
  { member_id: 'MEM022', name: 'NISHITHA GAYATH', password: '111111' },
  { member_id: 'MEM023', name: 'KAVISHKA DILSHAN', password: '111111' },
  { member_id: 'MEM024', name: 'CHARITH DILANKA', password: '111111' },
  { member_id: 'MEM025', name: 'BINUKA NETHMIN', password: '111111' },
  { member_id: 'MEM026', name: 'MINDULA GANGANATH', password: '111111' },
  { member_id: 'MEM027', name: 'PASAN KAUMINDA', password: '111111' },
  { member_id: 'MEM028', name: 'NAJAN MOHOMAD', password: '111111' },
  { member_id: 'MEM029', name: 'MOHOMAD HASIK', password: '111111' },
  { member_id: 'MEM030', name: 'PASINDU SANKALPA', password: '111111' },
  { member_id: 'MEM031', name: 'UMESHA GANGANATH', password: '111111' },
  { member_id: 'MEM032', name: 'SAMPATH DARMADASA', password: '111111' },
  { member_id: 'MEM033', name: 'SUBODHA MADUMALI', password: '111111' },
  { member_id: 'MEM034', name: 'ABHISHEK DHANANJAYA', password: '111111' },
  { member_id: 'MEM035', name: 'THARANGA WIJERIYA', password: '111111' },
  { member_id: 'MEM036', name: 'CHATHURA JAYANTH', password: '111111' },
  { member_id: 'MEM037', name: 'KAVINDU DULANJANA', password: '111111' },
  { member_id: 'MEM038', name: 'HAMDAN FARIS', password: '111111' },
  { member_id: 'MEM039', name: 'SHARAF MOHOAD', password: '111111' },
  { member_id: 'MEM040', name: 'M SILVA', password: '111111' },
  { member_id: 'MEM041', name: 'DAMITH KARUNARATNE', password: '111111' },
  { member_id: 'MEM042', name: 'WINAYA EKANAYAKA', password: '111111' },
  { member_id: 'MEM043', name: 'LAKSHITHA NUWAN', password: '111111' },
  { member_id: 'MEM044', name: 'SUSANTHA GMS', password: '111111' },
  { member_id: 'MEM045', name: 'MADUSHAN LAKSHITHA', password: '111111' },
  { member_id: 'MEM046', name: 'KAVINDI LIYANAGE', password: '111111' },
  { member_id: 'MEM047', name: 'MOHOMAD AKEEL', password: '111111' },
  { member_id: 'MEM048', name: 'DINETH HEWAVITHARANA', password: '111111' },
  { member_id: 'MEM049', name: 'SHAN SHASHWIN', password: '111111' },
  { member_id: 'MEM050', name: 'DULEEPA LAKSHAN', password: '111111' },
  { member_id: 'MEM051', name: 'UCHITHA ROSHANA', password: '111111' },
  { member_id: 'MEM052', name: 'PRAKRSHA PETHMIN', password: '111111' },
  { member_id: 'MEM053', name: 'RANDEEP RUCHIRA', password: '111111' },
  { member_id: 'MEM054', name: 'RAVINATH NIROSHAN', password: '111111' },
  { member_id: 'MEM055', name: 'RUVINI NILANTHI', password: '111111' },
  { member_id: 'MEM056', name: 'HASITH BHASURU', password: '111111' },
  { member_id: 'MEM057', name: 'KAPILA GAYAN', password: '111111' },
  { member_id: 'MEM058', name: 'PAVITH BASURU', password: '111111' },
  { member_id: 'MEM059', name: 'HASHAN KESARA', password: '111111' },
  { member_id: 'MEM060', name: 'SHASHIKA DILSHAN', password: '111111' },
  { member_id: 'MEM062', name: 'PATHUM LAKSHAN', password: '111111' },
  { member_id: 'MEM063', name: 'CHANUDA MITHSADA', password: '111111' },
  { member_id: 'MEM064', name: 'KESHAN HASARANGA', password: '111111' },
  { member_id: 'MEM065', name: 'MALINDA PRASANJITH', password: '111111' },
  { member_id: 'MEM066', name: 'HILMI AMLAN', password: '111111' },
  { member_id: 'MEM067', name: 'MOHOMAD SHAFNI', password: '111111' },
  { member_id: 'MEM068', name: 'BHANUKA PRAMUD', password: '111111' },
  { member_id: 'MEM069', name: 'MOHAMED AFRID', password: '111111' },
  { member_id: 'MEM070', name: 'MENURI DANIEL', password: '111111' },
  { member_id: 'MEM071', name: 'NIFLAN MOHOMAD', password: '111111' },
  { member_id: 'MEM072', name: 'SACHINI GUNASEKARA', password: '111111' },
  { member_id: 'MEM073', name: 'RUVINI MADHUSHANI', password: '111111' },
  { member_id: 'MEM074', name: 'SUDAM SATHYAJITH', password: '111111' },
  { member_id: 'MEM075', name: 'DINUKA SRI', password: '111111' },
  { member_id: 'MEM076', name: 'THARINDU NIKESHANA', password: '111111' },
  { member_id: 'MEM077', name: 'PAWAN SATHSARA', password: '111111' },
  { member_id: 'MEM078', name: 'OSHITHA WIJESINGHE', password: '111111' },
  { member_id: 'MEM079', name: 'RUKAIZ RAWZAN', password: '111111' },
  { member_id: 'MEM080', name: 'BIMSARA NIMESH', password: '111111' },
  { member_id: 'MEM081', name: 'JAITH FONSEKA', password: '111111' },
  { member_id: 'MEM082', name: 'SAIF AHAMED', password: '111111' },
  { member_id: 'MEM083', name: 'SASIRI SATHYANGANA', password: '111111' },
  { member_id: 'MEM084', name: 'SITHARA MADHUSHANI', password: '111111' },
  { member_id: 'MEM085', name: 'CHARITH JAYASINGHE', password: '111111' },
  { member_id: 'MEM086', name: 'DESHANE NRICO', password: '111111' },
  { member_id: 'MEM087', name: 'MOHOMED SHAHUDH', password: '111111' },
  { member_id: 'MEM088', name: 'ABDHULLAH RIFKHAN', password: '111111' },
  { member_id: 'MEM089', name: 'LASITHA EK', password: '111111' },
  { member_id: 'MEM090', name: 'OSHADHA KAVISHAN', password: '111111' },
  { member_id: 'MEM091', name: 'KAVINDU DIHAN', password: '111111' },
  { member_id: 'MEM092', name: 'MIHIRI RATHNASENA', password: '111111' },
  { member_id: 'MEM093', name: 'ISURU WEERAKOON', password: '111111' },
  { member_id: 'MEM094', name: 'CHAMUDITHA JEEVANTH', password: '111111' },
  { member_id: 'MEM095', name: 'NUSHRAN NAZAR', password: '111111' },
  { member_id: 'MEM096', name: 'RAYAN J', password: '111111' },
  { member_id: 'MEM097', name: 'INDIKA HARSHA', password: '111111' },
  { member_id: 'MEM098', name: 'NIMANTHIKA DILRUKSHI', password: '111111' },
  { member_id: 'MEM099', name: 'CHANDANI HEVAGEGALA', password: '111111' },
  { member_id: 'MEM100', name: 'AMODAYA ANUBHA', password: '111111' },
  { member_id: 'MEM101', name: 'DULKETH SATHMIRA', password: '111111' },
  { member_id: 'MEM102', name: 'SHEHAN MENUKA', password: '111111' },
  { member_id: 'MEM103', name: 'SADARU ABHI', password: '111111' },
  { member_id: 'MEM104', name: 'NAVINDU NETHSARA', password: '111111' },
  { member_id: 'MEM105', name: 'KAVINDU HIRAN', password: '111111' },
  { member_id: 'MEM106', name: 'NAVINDU HANSARA', password: '111111' },
  { member_id: 'MEM108', name: 'SIVA SIVARAJ', password: '111111' },
  { member_id: 'MEM109', name: 'SATHMINI KAUSHALYA', password: '111111' },
  { member_id: 'MEM111', name: 'RAVISHANKA BANDARA', password: '111111' },
  { member_id: 'MEM112', name: 'SUNIL RANJITH', password: '111111' },
  { member_id: 'MEM113', name: 'NIKIL SANJAYA', password: '111111' },
  { member_id: 'MEM114', name: 'HIRUNA MITHDIL', password: '111111' },
  { member_id: 'MEM115', name: 'PASINDU ARUNODA', password: '111111' },
  { member_id: 'MEM116', name: 'DARSHI DILRUKSHI', password: '111111' },
  { member_id: 'MEM117', name: 'HANSI WK', password: '111111' },
  { member_id: 'MEM118', name: 'ERANDA HEMACHANDRA', password: '111111' },
  { member_id: 'MEM119', name: 'SAMEERA KASUN', password: '111111' },
  { member_id: 'MEM120', name: 'KAWYA THEEKSHANI', password: '111111' },
  { member_id: 'MEM121', name: 'PASAN NETHDULA', password: '111111' },
  { member_id: 'MEM122', name: 'SENURA ESHAN', password: '111111' },
  { member_id: 'MEM123', name: 'HIRUNA WIJAYASINGHE', password: '111111' },
  { member_id: 'MEM124', name: 'SHASHI PATHIRANA', password: '111111' },
  { member_id: 'MEM125', name: 'MOHOMED HADHI', password: '111111' },
  { member_id: 'MEM126', name: 'YOUSUF AHAMED', password: '111111' },
  { member_id: 'MEM127', name: 'MAHESH WIJAMUNI', password: '111111' },
  { member_id: 'MEM128', name: 'DINETH SUMEDHA', password: '111111' },
  { member_id: 'MEM129', name: 'JANUKA SANSALA', password: '111111' },
  { member_id: 'MEM130', name: 'RANIDU PRAMOD', password: '111111' },
  { member_id: 'MEM131', name: 'LITHUNI LIHARA', password: '111111' },
  { member_id: 'MEM132', name: 'HAREEN ANURADHA', password: '111111' },
  { member_id: 'MEM133', name: 'DULAJ FDO', password: '111111' },
  { member_id: 'MEM134', name: 'SUMUDU MADHUSANKA', password: '111111' },
  { member_id: 'MEM135', name: 'SACHIN RASHMIKA', password: '111111' },
  { member_id: 'MEM136', name: 'HASINDU RAJAPAKSHA', password: '111111' },
  { member_id: 'MEM137', name: 'GAYANTHA CHATHURANGA', password: '111111' },
  { member_id: 'MEM139', name: 'MALINDU AMESH', password: '111111' },
  { member_id: 'MEM140', name: 'MENUKA SAMPATH', password: '111111' },
  { member_id: 'MEM141', name: 'DULSHAN BASHHTHA', password: '111111' },
  { member_id: 'MEM142', name: 'DHANANJANI HERATH', password: '111111' },
  { member_id: 'MEM143', name: 'HANSI DILMINI', password: '111111' },
  { member_id: 'MEM146', name: 'IMALKA MADHUSHANI', password: '111111' },
  { member_id: 'MEM147', name: 'THARINDU DHANUSHMAN', password: '111111' },
  { member_id: 'MEM148', name: 'MOHOMED FIRTHAWS', password: '111111' },
  { member_id: 'MEM149', name: 'EMINDU THEEJAN', password: '111111' },
  { member_id: 'MEM150', name: 'PASINDU LAKMAL', password: '111111' },
  { member_id: 'MEM151', name: 'SANDARU SAMARANAYAKA', password: '111111' },
  { member_id: 'MEM152', name: 'AYOMI RAJAPAKSHA', password: '111111' },
  { member_id: 'MEM153', name: 'ANURADHA', password: '111111' },
  { member_id: 'MEM154', name: 'AMILA PEELEWATTA', password: '111111' },
  { member_id: 'MEM155', name: 'PRASANNAA', password: '111111' },
  { member_id: 'MEM156', name: 'OSHANI RATHNAYAKA', password: '111111' },
  { member_id: 'MEM157', name: 'NIROSHAN NIRO', password: '111111' },
  { member_id: 'MEM158', name: 'CHATHURIKA JAYAMINI', password: '111111' },
  { member_id: 'MEM159', name: 'NIMESHA ERANDI', password: '111111' },
  { member_id: 'MEM160', name: 'MOHOMED AQEEL', password: '111111' },
  { member_id: 'MEM161', name: 'MOHAMMED FARNAS', password: '111111' },
  { member_id: 'MEM162', name: 'MOHAMMED RIYAF', password: '111111' },
  { member_id: 'MEM163', name: 'SAMEERA SAMPATH', password: '111111' },
  { member_id: 'MEM164', name: 'GAYAN DANUSHKA', password: '111111' },
  { member_id: 'MEM165', name: 'MSM RISLAN', password: '111111' },
  { member_id: 'MEM166', name: 'THARUKI SADAREKA', password: '111111' },
  { member_id: 'MEM167', name: 'KAIF MOHAMED', password: '111111' },
  { member_id: 'MEM168', name: 'NIMNADI VIHARI', password: '111111' },
  { member_id: 'MEM169', name: 'UDULA GH', password: '111111' },
  { member_id: 'MEM170', name: 'YASIRU SHAHITH', password: '111111' },
  { member_id: 'MEM171', name: 'BUVINDU ISATH', password: '111111' },
  { member_id: 'MEM172', name: 'SINENETH DULANJANA', password: '111111' },
  { member_id: 'MEM173', name: 'SURESH KUMARA', password: '111111' },
  { member_id: 'MEM174', name: 'DINAL SITHIL', password: '111111' },
  { member_id: 'MEM175', name: 'CHATHURA GEETHANJAM', password: '111111' },
  { member_id: 'MEM177', name: 'KAVEESHA PRAMOD', password: '111111' },
  { member_id: 'MEM178', name: 'MALITH BANDARA', password: '111111' },
  { member_id: 'MEM179', name: 'ANANDA RUWANSIRI', password: '111111' },
  { member_id: 'MEM180', name: 'MOHAMMED RAAID', password: '111111' },
  { member_id: 'MEM181', name: 'SAVINDANI KODIKARA', password: '111111' },
  { member_id: 'MEM182', name: 'DEVIN LIYANAGE', password: '111111' },
  { member_id: 'MEM185', name: 'NIZMY NIHAL', password: '111111' },
  { member_id: 'MEM186', name: 'JANITH CHAMARA', password: '111111' },
  { member_id: 'MEM187', name: 'MOHOMAD RILWAN', password: '111111' },
  { member_id: 'MEM190', name: 'MOHOMAD SUREJ', password: '111111' },
  { member_id: 'MEM191', name: 'BUDDHIKA ASELA', password: '111111' },
  { member_id: 'MEM192', name: 'SAHAS NETHMINA', password: '111111' },
  { member_id: 'MEM193', name: 'JAYA KUMAR', password: '111111' },
  { member_id: 'MEM194', name: 'DHANUSHKA CHATHURANGA', password: '111111' },
  { member_id: 'MEM195', name: 'ISANKA CHANDANA', password: '111111' },
  { member_id: 'MEM196', name: 'ROSHAN RATHNASIRI', password: '111111' },
  { member_id: 'MEM197', name: 'KAVETH MITHSANDA', password: '111111' },
  { member_id: 'MEM198', name: 'SUJAAN DHANUSHKA', password: '111111' },
  { member_id: 'MEM199', name: 'ASHEN PRASAD', password: '111111' },
  { member_id: 'MEM200', name: 'HARSHANI WK', password: '111111' },
  { member_id: 'MEM201', name: 'DIMUTHU DE SILVA', password: '111111' },
  { member_id: 'MEM202', name: 'SAMEERA GEETHANJANA', password: '111111' },
  { member_id: 'MEM203', name: 'SHAHALAN MOHOAD', password: '111111' },
  { member_id: 'MEM204', name: 'ISHAQ AHAMED', password: '111111' },
  { member_id: 'MEM205', name: 'RUKSHAN NAZAR', password: '111111' },
  { member_id: 'MEM206', name: 'SADEW HIRUDITHA', password: '111111' },
  { member_id: 'MEM207', name: 'THISARA SRI', password: '111111' },
  { member_id: 'MEM208', name: 'GAYANI KAVINDI', password: '111111' },
  { member_id: 'MEM209', name: 'MADDHU AIYA', password: '111111' },
  { member_id: 'MEM210', name: 'SASHA SELLAHEWA', password: '111111' },
  { member_id: 'MEM211', name: 'HUSAIN ILYAS', password: '111111' },
  { member_id: 'MEM212', name: 'LAKSHI DAYANANDA', password: '111111' },
  { member_id: 'MEM213', name: 'IMAL THARUNETHU', password: '111111' },
  { member_id: 'MEM214', name: 'ASHIK', password: '111111' },
  { member_id: 'MEM215', name: 'HASHAN THEJANA', password: '111111' },
  { member_id: 'MEM216', name: 'GANINDU CHAMPATHI', password: '111111' },
  { member_id: 'MEM217', name: 'LAKMALI WATHSALA', password: '111111' },
  { member_id: 'MEM218', name: 'PIUMI ISANKA', password: '111111' },
  { member_id: 'MEM219', name: 'CHIRAN SAMPATH', password: '111111' },
  { member_id: 'MEM220', name: 'SAMITH AKASH', password: '111111' },
  { member_id: 'MEM221', name: 'PASANGA MIHIRAN', password: '111111' },
  { member_id: 'MEM222', name: 'SIDUSANKHA', password: '111111' },
  { member_id: 'MEM223', name: 'KOSALA DHANANJAYA', password: '111111' },
  { member_id: 'MEM224', name: 'MOHOMED USMAN', password: '111111' },
  { member_id: 'MEM225', name: 'DAMMIKA PRIYA', password: '111111' },
  { member_id: 'MEM226', name: 'SADARUWAN DHANANJAYA', password: '111111' },
  { member_id: 'MEM227', name: 'ASELA UDE', password: '111111' },
  { member_id: 'MEM228', name: 'IZZATH AHAMED', password: '111111' },
  { member_id: 'MEM229', name: 'DIHAN JAYARATHNE', password: '111111' },
  { member_id: 'MEM230', name: 'RAJINI KANTH', password: '111111' },
  { member_id: 'MEM231', name: 'KAVINDU THEEKSHANA', password: '111111' },
  { member_id: 'MEM232', name: 'SHAINI NETHMIKA', password: '111111' },
  { member_id: 'MEM233', name: 'MIGARA VIMUKTHI', password: '111111' },
  { member_id: 'MEM234', name: 'DAMITH CHATHURANGA', password: '111111' },
  { member_id: 'MEM235', name: 'AMAL INDIKA', password: '111111' },
]

function getMembersList(): RawMemberRecord[] {
  const csvFilePaths = [
    path.join(__dirname, '../gym_members.csv'),
    path.join(process.cwd(), 'gym_members.csv'),
  ]

  for (const csvPath of csvFilePaths) {
    if (fs.existsSync(csvPath)) {
      console.log(`📄 Found local CSV file at: ${csvPath}`)
      const rawContent = fs.readFileSync(csvPath, 'utf8')
      const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
      if (lines.length > 1) {
        const parsed: RawMemberRecord[] = []
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',')
          if (parts.length >= 2) {
            const mId = parts[0].trim()
            const mName = parts[1].trim()
            const mPass = parts[2] ? parts[2].trim() : '111111'
            if (mId && mName) {
              parsed.push({ member_id: mId, name: mName, password: mPass })
            }
          }
        }
        if (parsed.length > 0) {
          console.log(`✅ Successfully parsed ${parsed.length} members from ${csvPath}`)
          return parsed
        }
      }
    }
  }

  console.log(`ℹ️ Using embedded member dataset (${embeddedMembers.length} records).`)
  return embeddedMembers
}

async function seedMembers() {
  const membersToSeed = getMembersList()
  console.log(`🚀 Starting Bulk Member Seeding into Supabase... (${membersToSeed.length} members)\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < membersToSeed.length; i++) {
    const item = membersToSeed[i]
    const cleanId = item.member_id.trim().toUpperCase()
    const name = item.name.trim()
    const password = item.password || '111111'
    const syntheticEmail = `${cleanId}@gym.com`

    console.log(`[${i + 1}/${membersToSeed.length}] Processing ${cleanId} (${name})...`)

    try {
      let authUserId: string | null = null

      // 1. Create User in Supabase Auth via Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          member_id: cleanId,
        },
      })

      if (authError) {
        if (
          authError.message.toLowerCase().includes('already') ||
          authError.message.toLowerCase().includes('registered') ||
          authError.status === 422
        ) {
          // Fetch user ID from existing Auth accounts
          const { data: userList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const matched = userList?.users?.find(
            (u) => u.email?.toLowerCase() === syntheticEmail.toLowerCase()
          )

          if (matched) {
            authUserId = matched.id
            console.log(`   ℹ️ Auth user already exists: ${authUserId}`)
          } else {
            console.error(`   ❌ Auth Error for ${cleanId}: ${authError.message}`)
            errorCount++
            continue
          }
        } else {
          console.error(`   ❌ Auth Creation Failed for ${cleanId}: ${authError.message}`)
          errorCount++
          continue
        }
      } else if (authData?.user) {
        authUserId = authData.user.id
        console.log(`   ✨ Created Auth User ID: ${authUserId}`)
      }

      if (!authUserId) {
        console.error(`   ❌ Failed to resolve Auth User ID for ${cleanId}`)
        errorCount++
        continue
      }

      // 2. Insert/Upsert Profile into `public.members` table
      const joinedDate = new Date().toISOString().split('T')[0]

      const memberPayload: any = {
        id: authUserId,
        auth_user_id: authUserId,
        member_id: cleanId,
        full_name: name,
        name: name,
        phone: 'N/A',
        address: 'Balangoda',
        height: null,
        weight: null,
        starting_weight: null,
        tier: null,
        status: 'Inactive',
        joined_date: joinedDate,
        duration_months: null,
        expiry_date: null,
        emergency_contact: 'N/A',
      }

      const { error: dbError } = await supabase
        .from('members')
        .upsert([memberPayload], { onConflict: 'id' })

      if (dbError) {
        const { error: updateErr } = await supabase
          .from('members')
          .update(memberPayload)
          .eq('id', authUserId)

        if (updateErr) {
          console.error(`   ⚠️ DB Update Warning for ${cleanId}: ${updateErr.message}`)
          errorCount++
          continue
        } else {
          console.log(`   ✅ Successfully updated profile for ${cleanId} in members table.`)
        }
      } else {
        console.log(`   ✅ Successfully saved profile for ${cleanId} to members table.`)
      }

      successCount++
    } catch (err: any) {
      console.error(`   ❌ Exception processing ${cleanId}:`, err?.message || err)
      errorCount++
    }
  }

  console.log(`\n🎉 Bulk Seeding Completed!`)
  console.log(`────────────── Summary ──────────────`)
  console.log(`Total Members Processed: ${membersToSeed.length}`)
  console.log(`Successfully Ingested : ${successCount}`)
  console.log(`Errors / Failures     : ${errorCount}`)
  console.log(`────────────────────────────────────\n`)
}

seedMembers()

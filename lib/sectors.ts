export type SectorType =
  | "Commercial Banks"
  | "Development Banks"
  | "Finance"
  | "Life Insurance"
  | "Non Life Insurance"
  | "Hydropower"
  | "Manufacturing and Processing"
  | "Microfinance"
  | "Investment"
  | "Hotel and Tourism"
  | "Trading"
  | "Other"

// Map of company symbols to their sectors
export const sectorMap: Record<string, SectorType> = {
  // Commercial Banks
  NMB: "Commercial Banks",
  SBL: "Commercial Banks",
  KBL: "Commercial Banks",
  MBL: "Commercial Banks",
  EBL: "Commercial Banks",
  SBI: "Commercial Banks",
  HBL: "Commercial Banks",
  SCB: "Commercial Banks",
  NABIL: "Commercial Banks",
  CZBIL: "Commercial Banks",
  PCBL: "Commercial Banks",
  ADBL: "Commercial Banks",
  SANIMA: "Commercial Banks",
  NBL: "Commercial Banks",
  GBIME: "Commercial Banks",
  NICA: "Commercial Banks",
  PRVU: "Commercial Banks",
  NIMB: "Investment",
  LSL: "Commercial Banks",

  // Development Banks
  MDB: "Development Banks",
  GBBL: "Development Banks",
  JBBL: "Development Banks",
  KRBL: "Development Banks",
  NABBC: "Development Banks",
  EDBL: "Development Banks",
  SADBL: "Development Banks",
  MNBBL: "Development Banks",
  CORBL: "Development Banks",
  SINDU: "Development Banks",
  SHINE: "Development Banks",
  GRDBL: "Development Banks",
  MLBL: "Development Banks",
  KSBBL: "Development Banks",
  LBBL: "Development Banks",
  SAPDBL: "Development Banks",

  // Finance
  NFS: "Finance",
  BFC: "Finance",
  GFCL: "Finance",
  PFL: "Finance",
  SIFC: "Finance",
  CFCL: "Finance",
  JFL: "Finance",
  SFCL: "Finance",
  CMB: "Finance",
  GMFIL: "Finance",
  ICFC: "Finance",
  MPFL: "Finance",
  PROFL: "Finance",
  MFIL: "Finance",
  RLFL: "Finance",
  GUFL: "Finance",

  // Life Insurance
  RBCL: "Life Insurance",
  NLICL: "Life Insurance",
  NLIC: "Life Insurance",
  LICN: "Life Insurance",
  ALICL: "Life Insurance",
  ILI: "Life Insurance",
  RNLI: "Life Insurance",
  SNLI: "Life Insurance",
  CLI: "Life Insurance",
  SJLIC: "Life Insurance",
  HLI: "Life Insurance",
  SRLI: "Life Insurance",
  PMLI: "Life Insurance",

  // Non Life Insurance
  NICL: "Non Life Insurance",
  NIL: "Non Life Insurance",
  SICL: "Non Life Insurance",
  NLGI: "Non Life Insurance",
  RBCL: "Non Life Insurance",
  PRIN: "Non Life Insurance",
  HEI: "Non Life Insurance",
  SGIC: "Non Life Insurance",
  SPIL: "Non Life Insurance",
  SALICO: "Non Life Insurance",
  IGI: "Non Life Insurance",
  UAIL: "Non Life Insurance",

  // Hydropower
  NHPC: "Hydropower",
  BPCL: "Hydropower",
  CHCL: "Hydropower",
  AHPC: "Hydropower",
  SJCL: "Hydropower",
  SHPC: "Hydropower",
  RHPL: "Hydropower",
  BARUN: "Hydropower",
  UPPER: "Hydropower",
  MBJC: "Hydropower",
  AKPL: "Hydropower",
  API: "Hydropower",
  MKJC: "Hydropower",
  DORDI: "Hydropower",
  TVCL: "Hydropower",
  MHL: "Hydropower",
  DHPL: "Hydropower",
  NYADI: "Hydropower",
  NGPL: "Hydropower",
  RADHI: "Hydropower",
  KKHC: "Hydropower",
  GHL: "Hydropower",
  HURJA: "Hydropower",
  UMHL: "Hydropower",
  AKJCL: "Hydropower",
  UPCL: "Hydropower",
  SPL: "Hydropower",
  NHDL: "Hydropower",
  SPDL: "Hydropower",
  HPPL: "Hydropower",
  CHL: "Hydropower",
  SAHAS: "Hydropower",
  JOSHI: "Hydropower",
  BHPL: "Hydropower",
  MHNL: "Hydropower",
  PMHPL: "Hydropower",
  UNHPL: "Hydropower",
  KPCL: "Hydropower",
  PPCL: "Hydropower",
  RHGCL: "Hydropower",
  HDHPC: "Hydropower",
  MKHC: "Hydropower",
  SSHL: "Hydropower",
  RURU: "Hydropower",
  USHEC: "Hydropower",
  EHPL: "Hydropower",
  USHL: "Hydropower",
  GLH: "Hydropower",
  BHDC: "Hydropower",
  RFPL: "Hydropower",
  BNHC: "Hydropower",
  TAMOR: "Hydropower",
  SHEL: "Hydropower",
  SPHL: "Hydropower",
  MEN: "Hydropower",
  BEDC: "Hydropower",
  TSHL: "Hydropower",
  LEC: "Hydropower",
  UMRH: "Hydropower",
  UHEWA: "Hydropower",
  HHL: "Hydropower",
  MMKJL: "Hydropower",
  TPC: "Hydropower",
  BHL: "Hydropower",
  PPL: "Hydropower",
  SPC: "Hydropower",
  SGHC: "Hydropower",
  AHL: "Hydropower",
  PHCL: "Hydropower",
  SMH: "Hydropower",
  MHCL: "Hydropower",
  SIKLES: "Hydropower",
  GVL: "Hydropower",
  MAKAR: "Hydropower",
  BGWT: "Hydropower",
  MEL: "Hydropower",
  MSHL: "Hydropower",
  IHL: "Hydropower",
  SMHL: "Hydropower",
  MKHL: "Hydropower",
  SMJC: "Hydropower",
  RAWA: "Hydropower",
  RIDI: "Hydropower",
  DOLTI: "Hydropower",
  MCHL: "Hydropower",
  ULHC: "Hydropower",
  CKHL: "Hydropower",
  MANDU: "Hydropower",
  MEHL: "Hydropower",
  VLUCL: "Hydropower",
  KBSH: "Hydropower",

  // Add more mappings for other sectors
  // Microfinance examples
  CBBL: "Microfinance",
  MMFDB: "Microfinance",
  MERO: "Microfinance",
  GBLBS: "Microfinance",
  SMATA: "Microfinance",

  // Investment examples
  NIFRA: "Investment",
  HIDCL: "Investment",
  NRN: "Investment",

  // Hotel and Tourism examples
  OHL: "Hotel and Tourism",
  TRH: "Hotel and Tourism",
  SHL: "Hotel and Tourism",

  // Manufacturing and Processing examples
  UNL: "Manufacturing and Processing",
  HDL: "Manufacturing and Processing",
  BNL: "Manufacturing and Processing",

  // Trading examples
  BBC: "Trading",
  STC: "Trading",
}

export function getSectorForSymbol(symbol: string): SectorType {
  return sectorMap[symbol] || "Other"
}

export function groupStocksBySector<T extends { symbol: string }>(stocks: T[]): Record<SectorType, T[]> {
  const sectors: Record<SectorType, T[]> = {
    "Commercial Banks": [],
    "Development Banks": [],
    Finance: [],
    "Life Insurance": [],
    "Non Life Insurance": [],
    Hydropower: [],
    "Manufacturing and Processing": [],
    Microfinance: [],
    Investment: [],
    "Hotel and Tourism": [],
    Trading: [],
    Other: [],
  }

  stocks.forEach((stock) => {
    const sector = getSectorForSymbol(stock.symbol)
    sectors[sector].push(stock)
  })

  return sectors
}

export type Belt = 'Branca' | 'Cinza' | 'Amarela' | 'Laranja' | 'Verde' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta' | 'Vermelha'
export type Sport = 'Jiu-Jitsu' | 'Judô' | 'Karatê' | 'Muay Thai' | 'Boxe'

export interface Achievement {
  id: string
  date: string
  belt: Belt
  title: string
  hashPartial: string
  hashFull: string
  school: string
  graduatedBy: string
  note?: string
}

export interface Athlete {
  id: string
  publicId: string
  name: string
  surname: string
  sport: Sport
  school: string
  headCoach: string
  headCoachBelt: string
  photo: string | null
  achievements: Achievement[]
}

export interface School {
  id: string
  name: string
  sport: Sport[]
  logo: string | null
  headCoach: string
  headCoachBelt: string
  city: string
  state: string
  athleteCount: number
  certificateCount: number
}

export const mockAthletes: Athlete[] = [
  {
    id: 'athlete-001',
    publicId: 'FP-2024-004821',
    name: 'Carlos Eduardo',
    surname: 'Mendes Silva',
    sport: 'Jiu-Jitsu',
    school: 'Academia Tiger BJJ',
    headCoach: 'Luiz Felipe Villar',
    headCoachBelt: 'Faixa Preta 6° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-001',
        date: '2019-03-15',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'a3f12b90...9e04dc11',
        hashFull: 'a3f12b904c8d2e1f7a6b3c9d0e5f8a2b4c7d1e9f3a6b8c2d5e7f0a4b9c3d6e8',
        school: 'Academia Tiger BJJ',
        graduatedBy: 'Prof. Luiz Felipe Villar',
        note: 'Promovido por seu empenho e dedicação desde o início da prática.'
      },
      {
        id: 'ach-002',
        date: '2021-06-22',
        belt: 'Azul',
        title: 'Faixa Azul',
        hashPartial: 'd0f4600f...40a86bac',
        hashFull: 'd0f4600fddf38b6020d3fb82b9a131229d22a9b443b06b205aab810f59135aa4',
        school: 'Academia Tiger BJJ',
        graduatedBy: 'Prof. Luiz Felipe Villar',
        note: 'Promovido a Faixa Azul em 22/06/2021 pelo Professor Faixa Preta 6° Grau Luiz Felipe Villar por seu mérito e dedicação.'
      },
      {
        id: 'ach-003',
        date: '2023-08-10',
        belt: 'Roxa',
        title: 'Faixa Roxa',
        hashPartial: '7c9a31fe...f2d18e90',
        hashFull: '7c9a31fe4b2d8a1c6e3f7b9d2a4c8e1f5b3d7a2c6e9f1b4d8a3c7e2f6b1d5a9',
        school: 'Academia Tiger BJJ',
        graduatedBy: 'Prof. Luiz Felipe Villar',
        note: 'Promovido a Faixa Roxa pelo cumprimento de todos os requisitos técnicos e interstício de tempo.'
      }
    ]
  },
  {
    id: 'athlete-002',
    publicId: 'FP-2024-003102',
    name: 'Ana Beatriz',
    surname: 'Rodrigues',
    sport: 'Jiu-Jitsu',
    school: 'Gracie Barra SP',
    headCoach: 'Marcos Souza',
    headCoachBelt: 'Faixa Preta 3° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-004',
        date: '2022-04-10',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'b1e23a4c...7f8d9e0a',
        hashFull: 'b1e23a4c5d6f7e8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
        school: 'Gracie Barra SP',
        graduatedBy: 'Prof. Marcos Souza'
      },
      {
        id: 'ach-005',
        date: '2024-02-14',
        belt: 'Azul',
        title: 'Faixa Azul',
        hashPartial: 'c2f34b5d...8a9e0f1b',
        hashFull: 'c2f34b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
        school: 'Gracie Barra SP',
        graduatedBy: 'Prof. Marcos Souza'
      }
    ]
  },
  {
    id: 'athlete-003',
    publicId: 'FP-2024-005890',
    name: 'Rafael',
    surname: 'Torres Lima',
    sport: 'Jiu-Jitsu',
    school: 'Team Nogueira RJ',
    headCoach: 'Anderson Melo',
    headCoachBelt: 'Faixa Preta 4° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-006',
        date: '2015-07-20',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'd3a45c6e...9b0f1a2c',
        hashFull: 'd3a45c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
        school: 'Team Nogueira RJ',
        graduatedBy: 'Prof. Anderson Melo'
      },
      {
        id: 'ach-007',
        date: '2017-03-14',
        belt: 'Azul',
        title: 'Faixa Azul',
        hashPartial: 'e4b56d7f...0c1a2b3d',
        hashFull: 'e4b56d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
        school: 'Team Nogueira RJ',
        graduatedBy: 'Prof. Anderson Melo'
      },
      {
        id: 'ach-008',
        date: '2019-09-05',
        belt: 'Roxa',
        title: 'Faixa Roxa',
        hashPartial: 'f5c67e8a...1d2b3c4e',
        hashFull: 'f5c67e8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        school: 'Team Nogueira RJ',
        graduatedBy: 'Prof. Anderson Melo'
      },
      {
        id: 'ach-009',
        date: '2021-11-20',
        belt: 'Marrom',
        title: 'Faixa Marrom',
        hashPartial: 'a6d78f9b...2e3c4d5f',
        hashFull: 'a6d78f9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
        school: 'Team Nogueira RJ',
        graduatedBy: 'Prof. Anderson Melo'
      },
      {
        id: 'ach-010',
        date: '2024-01-30',
        belt: 'Preta',
        title: 'Faixa Preta',
        hashPartial: 'b7e89a0c...3f4d5e6a',
        hashFull: 'b7e89a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        school: 'Team Nogueira RJ',
        graduatedBy: 'Prof. Anderson Melo'
      }
    ]
  },
  {
    id: 'athlete-004',
    publicId: 'FP-2024-001234',
    name: 'Juliana',
    surname: 'Costa Freitas',
    sport: 'Jiu-Jitsu',
    school: 'Alliance SP',
    headCoach: 'Fábio Gurgel',
    headCoachBelt: 'Faixa Preta 7° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-011',
        date: '2018-05-12',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'c8f90b1d...4a5e6f7b',
        hashFull: 'c8f90b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
        school: 'Alliance SP',
        graduatedBy: 'Prof. Fábio Gurgel'
      },
      {
        id: 'ach-012',
        date: '2023-11-05',
        belt: 'Marrom',
        title: 'Faixa Marrom',
        hashPartial: 'd9a01c2e...5b6f7a8c',
        hashFull: 'd9a01c2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
        school: 'Alliance SP',
        graduatedBy: 'Prof. Fábio Gurgel'
      }
    ]
  },
  {
    id: 'athlete-005',
    publicId: 'FP-2024-007643',
    name: 'Pedro Henrique',
    surname: 'Alves',
    sport: 'Jiu-Jitsu',
    school: 'Checkmat Brasil',
    headCoach: 'Leo Vieira',
    headCoachBelt: 'Faixa Preta 5° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-013',
        date: '2023-01-15',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'e0b12d3f...6c7a8b9d',
        hashFull: 'e0b12d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
        school: 'Checkmat Brasil',
        graduatedBy: 'Prof. Leo Vieira'
      },
      {
        id: 'ach-014',
        date: '2024-03-20',
        belt: 'Azul',
        title: 'Faixa Azul',
        hashPartial: 'f1c23e4a...7d8b9c0e',
        hashFull: 'f1c23e4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
        school: 'Checkmat Brasil',
        graduatedBy: 'Prof. Leo Vieira'
      }
    ]
  },
  {
    id: 'athlete-006',
    publicId: 'FP-2024-002891',
    name: 'Mariana',
    surname: 'Ferreira',
    sport: 'Jiu-Jitsu',
    school: 'Atos Jiu-Jitsu',
    headCoach: 'André Galvão',
    headCoachBelt: 'Faixa Preta 4° Grau',
    photo: null,
    achievements: [
      {
        id: 'ach-015',
        date: '2020-08-30',
        belt: 'Branca',
        title: 'Início da Jornada',
        hashPartial: 'a2d34f5b...8e9c0d1f',
        hashFull: 'a2d34f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
        school: 'Atos Jiu-Jitsu',
        graduatedBy: 'Prof. André Galvão'
      },
      {
        id: 'ach-016',
        date: '2023-09-18',
        belt: 'Roxa',
        title: 'Faixa Roxa',
        hashPartial: 'b3e45a6c...9f0d1e2a',
        hashFull: 'b3e45a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
        school: 'Atos Jiu-Jitsu',
        graduatedBy: 'Prof. André Galvão'
      }
    ]
  }
]

export const mockSchools: School[] = [
  { id: 'school-001', name: 'Academia Tiger BJJ', sport: ['Jiu-Jitsu'], logo: null, headCoach: 'Luiz Felipe Villar', headCoachBelt: 'Faixa Preta 6° Grau', city: 'São Paulo', state: 'SP', athleteCount: 47, certificateCount: 112 },
  { id: 'school-002', name: 'Gracie Barra SP', sport: ['Jiu-Jitsu'], logo: null, headCoach: 'Marcos Souza', headCoachBelt: 'Faixa Preta 3° Grau', city: 'São Paulo', state: 'SP', athleteCount: 89, certificateCount: 203 },
  { id: 'school-003', name: 'Team Nogueira RJ', sport: ['Jiu-Jitsu', 'Muay Thai'], logo: null, headCoach: 'Anderson Melo', headCoachBelt: 'Faixa Preta 4° Grau', city: 'Rio de Janeiro', state: 'RJ', athleteCount: 134, certificateCount: 387 }
]

export const mockStats = {
  totalAthletes: 1247,
  totalSchools: 89,
  totalCertificates: 3891
}

export const mockCurrentSchool: School = mockSchools[0]

export const mockCredits = {
  balance: 12,
  transactions: [
    { id: 'tx-001', date: '2024-01-15', package: 'Escola', credits: 50, amount: 397, status: 'Concluído' as const },
    { id: 'tx-002', date: '2023-08-20', package: 'Starter', credits: 10, amount: 97, status: 'Concluído' as const },
  ]
}

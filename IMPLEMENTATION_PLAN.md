# Complete Tournament Management System - Implementation Plan

## 🎯 Overview
Building a Swiss Manager-style tournament management system with complete workflow from player registration to final results.

---

## 📊 Database Schema (✅ DONE)

### Tables Created:
1. ✅ `player_pool` - Master player database
2. ✅ `tournaments` - Tournament metadata
3. ✅ `tournament_registrations` - Registration & check-in
4. ✅ `check_in_log` - Detailed check-in tracking
5. ✅ `result_entries` - Result entry audit
6. ✅ `arbiter_actions` - Complete action log
7. ✅ `tournament_statistics` - Cached stats

---

## 🏗️ Implementation Phases

### **PHASE 1: Foundation** (Week 1)
**Goal**: Basic navigation and player management

#### 1.1 Navigation Update
- [ ] Update main navigation menu
- [ ] Add new routes:
  - `/dashboard` - Overview
  - `/players` - Player pool
  - `/tournaments` - Tournament list
  - `/tournament/:id` - Tournament detail
  - `/tournament/:id/checkin` - Check-in
  - `/tournament/:id/control` - Tournament control
  - `/reports` - Reports

#### 1.2 Player Pool Management
**Page**: `/app/players/page.tsx`
- [ ] Player list with search/filter
- [ ] Add/Edit/Delete player
- [ ] Import from CSV
- [ ] Export player list
- [ ] Player detail view
- [ ] Player statistics

**Components**:
- [ ] `PlayerList.tsx` - Table with all players
- [ ] `PlayerDialog.tsx` - Add/Edit form
- [ ] `PlayerImport.tsx` - CSV import
- [ ] `PlayerCard.tsx` - Player detail card

#### 1.3 Dashboard
**Page**: `/app/dashboard/page.tsx`
- [ ] Active tournaments
- [ ] Quick actions
- [ ] Recent activity
- [ ] Statistics overview

---

### **PHASE 2: Tournament Creation** (Week 2)
**Goal**: Create and configure tournaments

#### 2.1 Tournament List
**Page**: `/app/tournaments/page.tsx`
- [ ] List all tournaments
- [ ] Filter by status
- [ ] Create new tournament
- [ ] Tournament cards

#### 2.2 Tournament Creation
**Page**: `/app/tournaments/new/page.tsx`
- [ ] Tournament setup form
- [ ] Format selection (Swiss/Round Robin/Knockout)
- [ ] Settings configuration
- [ ] Entry fee setup
- [ ] Prize pool configuration

**Components**:
- [ ] `TournamentForm.tsx` - Main form
- [ ] `FormatSelector.tsx` - Format picker
- [ ] `SettingsPanel.tsx` - Tournament settings
- [ ] `PrizePoolCalculator.tsx` - Prize calculator

#### 2.3 Tournament Registration
**Page**: `/app/tournament/:id/register/page.tsx`
- [ ] Register players from pool
- [ ] Bulk registration
- [ ] Registration list
- [ ] Remove registrations

---

### **PHASE 3: Check-In System** (Week 3)
**Goal**: Tournament day check-in and entry fee collection

#### 3.1 Check-In Page
**Page**: `/app/tournament/:id/checkin/page.tsx`
- [ ] Registration list view
- [ ] Quick search
- [ ] Check-in button
- [ ] Entry fee tracking
- [ ] Payment recording
- [ ] No-show marking
- [ ] Walk-in registration
- [ ] Print labels/cards

**Components**:
- [ ] `CheckInList.tsx` - Main check-in table
- [ ] `CheckInRow.tsx` - Individual player row
- [ ] `PaymentDialog.tsx` - Record payment
- [ ] `WalkInDialog.tsx` - Add walk-in player
- [ ] `CheckInStats.tsx` - Stats display

#### 3.2 Finalize Tournament
- [ ] Review checked-in players
- [ ] Remove no-shows
- [ ] Assign pairing numbers
- [ ] Create tournament players
- [ ] START TOURNAMENT button

---

### **PHASE 4: Tournament Control** (Week 4) **CRITICAL**
**Goal**: Round-by-round tournament management

#### 4.1 Tournament Control Page
**Page**: `/app/tournament/:id/control/page.tsx`
- [ ] Round overview
- [ ] Current round status
- [ ] Quick actions
- [ ] Tabs: Pairings / Results / Standings / Players

**Components**:
- [ ] `TournamentHeader.tsx` - Tournament info
- [ ] `RoundControl.tsx` - Round controls
- [ ] `QuickStats.tsx` - Live statistics

#### 4.2 Pairings View
**Tab**: Pairings
- [ ] Display current pairings
- [ ] Board numbers
- [ ] Player colors
- [ ] Click to enter result
- [ ] Print pairings
- [ ] Generate next round

**Components**:
- [ ] `PairingBoard.tsx` - Pairings display
- [ ] `PairingRow.tsx` - Individual pairing
- [ ] `GeneratePairingButton.tsx` - Generate button

#### 4.3 Result Entry (MOST CRITICAL)
**Component**: `ResultEntryDialog.tsx`
- [ ] Normal results (1-0, 0-1, ½-½)
- [ ] Forfeit options (+/-, -/+, -/-)
- [ ] Forfeit reason selector
- [ ] Sheriff badge usage
- [ ] Criminal status trigger
- [ ] Bounty calculation preview
- [ ] Notes field
- [ ] Save & Next button

**Features**:
- [ ] Validate results
- [ ] Calculate bounty transfer
- [ ] Update player stats
- [ ] Log to audit trail
- [ ] Real-time updates

#### 4.4 Standings View
**Tab**: Standings
- [ ] Live leaderboard
- [ ] Sort by: Bounty, Wins, Score
- [ ] Player details
- [ ] Color history
- [ ] Performance rating
- [ ] Export standings

---

### **PHASE 5: Arbiter Tools** (Week 5)
**Goal**: Advanced arbiter functionality

#### 5.1 Forfeit Declaration
**Component**: `ForfeitDialog.tsx`
- [ ] Select game
- [ ] Choose winner
- [ ] Forfeit reason
- [ ] Time tracking
- [ ] Auto-update BYE eligibility
- [ ] Notification to opponent

#### 5.2 Player Withdrawal
**Component**: `WithdrawalDialog.tsx`
- [ ] Select player
- [ ] Withdrawal reason
- [ ] Effective round
- [ ] Handle current game
- [ ] Future games forfeit
- [ ] Refund eligibility

#### 5.3 Late Entry
**Component**: `LateEntryDialog.tsx`
- [ ] Player selection/add
- [ ] Entry round
- [ ] TPN calculation
- [ ] Entry fee collection
- [ ] Immediate pairing

#### 5.4 Result Correction
**Component**: `ResultCorrectionDialog.tsx`
- [ ] Select game
- [ ] Show original result
- [ ] Enter correct result
- [ ] Recalculate standings
- [ ] Reason/notes
- [ ] Audit trail

#### 5.5 Arbiter Menu
**Component**: `ArbiterMenu.tsx`
- [ ] Quick access to all tools
- [ ] Keyboard shortcuts
- [ ] Recent actions
- [ ] Undo last action

---

### **PHASE 6: Public Views** (Week 6)
**Goal**: Public-facing displays

#### 6.1 Public Pairings Board
**Page**: `/public/tournament/:id/pairings`
- [ ] Large display format
- [ ] Auto-refresh
- [ ] Mobile responsive
- [ ] QR code access

#### 6.2 Public Leaderboard
**Page**: `/public/tournament/:id/standings`
- [ ] Live standings
- [ ] Player search
- [ ] Auto-refresh
- [ ] Prize positions

#### 6.3 Player Personal View
**Page**: `/public/tournament/:id/player/:id`
- [ ] My pairings
- [ ] My results
- [ ] My standing
- [ ] Next opponent
- [ ] Game history

---

### **PHASE 7: Reports & Export** (Week 7)
**Goal**: Reporting and data export

#### 7.1 Print Pairings
- [ ] PDF generation
- [ ] Wall chart format
- [ ] Board numbers
- [ ] Player cards

#### 7.2 Final Results
- [ ] Final standings PDF
- [ ] Prize list
- [ ] Complete tournament report
- [ ] Player certificates

#### 7.3 Export Data
- [ ] CSV export
- [ ] JSON export
- [ ] Swiss Manager format
- [ ] PGN export

#### 7.4 Statistics
- [ ] Tournament statistics
- [ ] Player statistics
- [ ] Financial report
- [ ] Arbiter report

---

### **PHASE 8: Polish & UX** (Week 8)
**Goal**: User experience refinement

#### 8.1 Mobile Optimization
- [ ] Mobile result entry
- [ ] Mobile check-in
- [ ] Mobile pairings view
- [ ] Touch-friendly UI

#### 8.2 Keyboard Shortcuts
- [ ] Result entry (1, 0, ½, F)
- [ ] Navigation (arrows)
- [ ] Quick save (Ctrl+S)
- [ ] Search (/)

#### 8.3 Real-time Updates
- [ ] WebSocket integration
- [ ] Live standing updates
- [ ] Push notifications
- [ ] Collaborative editing

#### 8.4 Offline Support
- [ ] Service worker
- [ ] Offline result entry
- [ ] Sync when online
- [ ] Conflict resolution

---

## 🎨 Design System

### Colors (Existing)
```typescript
primary: Material UI default
secondary: Accent colors
success: Green (#4caf50)
warning: Yellow (#ff9800)
error: Red (#f44336)
info: Blue (#2196f3)
```

### Typography
```typescript
Headings: Outfit (from Score360)
Body: Roboto/Inter
Monospace: Consolas (for board numbers)
```

### Components
- Material UI v5
- Custom dialogs
- Data tables
- Forms with validation
- Toast notifications

---

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Material UI v5
- **State**: React hooks + Context
- **Forms**: React Hook Form
- **Validation**: Zod
- **Real-time**: Supabase Realtime

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (for photos)
- **API**: Supabase Client

### Utilities
- **Pairing**: FIDE Swiss System (lib/fide-swiss-pairing)
- **Phase 4A**: Forfeit/Withdrawal/Late Entry (lib/phase4a)
- **Bounty**: Existing bounty.ts
- **PDF**: jsPDF / react-pdf
- **CSV**: papaparse
- **Date**: date-fns

---

## 📦 File Structure

```
app/
├── dashboard/
│   └── page.tsx
├── players/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── tournaments/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       ├── page.tsx (overview)
│       ├── register/
│       │   └── page.tsx
│       ├── checkin/
│       │   └── page.tsx
│       └── control/
│           └── page.tsx
├── public/
│   └── tournament/
│       └── [id]/
│           ├── pairings/
│           │   └── page.tsx
│           └── standings/
│               └── page.tsx
└── reports/
    └── page.tsx

components/
├── tournament/
│   ├── TournamentForm.tsx
│   ├── TournamentCard.tsx
│   ├── RoundControl.tsx
│   ├── PairingBoard.tsx
│   ├── ResultEntryDialog.tsx ⭐ CRITICAL
│   ├── Leaderboard.tsx
│   └── ...
├── players/
│   ├── PlayerList.tsx
│   ├── PlayerDialog.tsx
│   ├── PlayerCard.tsx
│   └── ...
├── checkin/
│   ├── CheckInList.tsx
│   ├── PaymentDialog.tsx
│   └── ...
└── arbiter/
    ├── ForfeitDialog.tsx
    ├── WithdrawalDialog.tsx
    ├── LateEntryDialog.tsx
    ├── ArbiterMenu.tsx
    └── ...

lib/
├── fide-swiss-pairing/ (✅ DONE)
├── phase4a/ (✅ DONE)
├── tournament/
│   ├── registration.ts
│   ├── checkin.ts
│   ├── result-entry.ts
│   └── statistics.ts
└── api/
    ├── player-pool.ts
    ├── tournaments.ts
    └── supabase-extended.ts
```

---

## 📋 Development Checklist

### Sprint 1: Foundation (Days 1-7)
- [ ] Run database migration
- [ ] Update navigation
- [ ] Build player pool page
- [ ] Build dashboard
- [ ] Test player CRUD

### Sprint 2: Tournament Setup (Days 8-14)
- [ ] Tournament list page
- [ ] Tournament creation form
- [ ] Registration page
- [ ] Test full registration flow

### Sprint 3: Check-In (Days 15-21)
- [ ] Check-in page
- [ ] Payment tracking
- [ ] Walk-in support
- [ ] Finalize tournament
- [ ] Test check-in flow

### Sprint 4: Tournament Control (Days 22-28) **CRITICAL**
- [ ] Control page layout
- [ ] Pairing display
- [ ] Result entry dialog
- [ ] Standings view
- [ ] Integration with FIDE pairing
- [ ] Test complete round cycle

### Sprint 5: Arbiter Tools (Days 29-35)
- [ ] Forfeit dialog
- [ ] Withdrawal dialog
- [ ] Late entry dialog
- [ ] Result correction
- [ ] Test all arbiter actions

### Sprint 6: Public Views (Days 36-42)
- [ ] Public pairings
- [ ] Public standings
- [ ] Mobile optimization
- [ ] Test public access

### Sprint 7: Reports (Days 43-49)
- [ ] PDF generation
- [ ] Export functionality
- [ ] Statistics views
- [ ] Test all reports

### Sprint 8: Polish (Days 50-56)
- [ ] UX improvements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Final testing
- [ ] Documentation

---

## 🚀 Deployment Checklist

- [ ] Database migrated
- [ ] Environment variables set
- [ ] RLS policies verified
- [ ] Functions deployed
- [ ] Public access configured
- [ ] SSL certificate
- [ ] Domain configured
- [ ] Backup strategy
- [ ] Monitoring setup
- [ ] User documentation

---

## 🎯 Success Criteria

1. ✅ Can manage 50+ players in pool
2. ✅ Can register players for tournament
3. ✅ Can check-in and collect fees
4. ✅ Can start tournament with FIDE pairing
5. ✅ Can enter results with all options
6. ✅ Can handle forfeit/withdrawal/late entry
7. ✅ Can view live standings
8. ✅ Can print/export reports
9. ✅ Mobile-friendly interface
10. ✅ Complete audit trail

---

**Status**: Ready to begin implementation
**Estimated Time**: 8 weeks full-time
**Priority**: Start with Sprints 1-4 (Core functionality)


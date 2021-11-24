import { CharacterState, DonationAlertState, SettingsState } from '@pftp/common'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialCharacterState: CharacterState = {
	isVisible: true,
	isLocked: false,
	scale: 1,
	flipX: false,
	position: {
		x: 1080 / 2,
		y: 1920 / 2,
	},
}
const characterSlice = createSlice({
	name: 'character',
	initialState: initialCharacterState,
	reducers: {
		update: (state, action: PayloadAction<Partial<CharacterState>>) => {
			return {
				...state,
				...action.payload,
			}
		},
	},
})

const initialSettingsState: SettingsState = {
	volume: 1,
}
const settingsSlice = createSlice({
	name: 'settings',
	initialState: initialSettingsState,
	reducers: {
		update: (state, action: PayloadAction<Partial<SettingsState>>) => {
			return {
				...state,
				...action.payload,
			}
		},
	},
})

const initialDonationAlertState: DonationAlertState = {
	isVisible: true,
	scale: 1,
}
const donationAlertSlice = createSlice({
	name: 'donationalert',
	initialState: initialDonationAlertState,
	reducers: {
		update: (state, action: PayloadAction<Partial<DonationAlertState>>) => {
			return {
				...state,
				...action.payload,
			}
		},
	},
})

export const characterReducer = characterSlice.reducer
export const updateCharacter = characterSlice.actions.update

export const donationAlertReducer = donationAlertSlice.reducer
export const updateDonationAlert = donationAlertSlice.actions.update

export const settingsReducer = settingsSlice.reducer
export const updateSettings = settingsSlice.actions.update

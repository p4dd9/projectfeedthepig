/* eslint-disable jsx-a11y/accessible-emoji */
import { GlobalState } from '@pftp/common'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FunctionComponent } from 'react'
import { Label, Content } from '../../../../pages/controlpanel'
import styled from 'styled-components'
import { CopyBrowserSourceButton } from './CopyBrowserSourceButton'
import { LockCharacterPositionButton } from './LockCharacterPositionButton'
import { UserDTO } from '../../../../pages/api/sessions'

export const CenterPanel: FunctionComponent<{ globalState: GlobalState; user: UserDTO }> = ({ globalState, user }) => {
	const contentRef = useRef<null | HTMLDivElement>(null)
	const [scale, setScale] = useState(0)

	const updateIframeSize = useCallback(() => {
		if (contentRef.current) {
			const { offsetHeight } = contentRef.current
			const newHeightScale = offsetHeight / 1080
			setScale(Number(newHeightScale.toFixed(10)))
		}
	}, [])

	useEffect(() => {
		updateIframeSize()
	}, [updateIframeSize])

	useEffect(() => {
		window.addEventListener('resize', updateIframeSize)
		return () => window.removeEventListener('resize', updateIframeSize)
	}, [updateIframeSize])

	return (
		<GridCenterPanel>
			<Label style={{ justifyContent: 'space-between', paddingRight: 0 }}>
				<div>
					<LiveEmoji role="img" aria-label="Live-Icon">
						🔴
					</LiveEmoji>
					Pigview
				</div>
				<PanelButtonWrapper>
					<CopyBrowserSourceButton title={'Copy overlay URL'} username={user.username} />
					<LockCharacterPositionButton isLocked={globalState.character.isLocked} title={'Lock character position'} />
				</PanelButtonWrapper>
			</Label>
			<Content ref={contentRef} style={{ padding: 0, position: 'relative', backgroundColor: 'black' }}>
				<OverlayIframe
					title="overlay"
					src={`/overlay/${user.username}?unlocked=true`}
					height={1080}
					width={1920}
					scale={scale}
				></OverlayIframe>
			</Content>
		</GridCenterPanel>
	)
}

const PanelButtonWrapper = styled.div`
	display: flex;
	align-items: center;
`

const OverlayIframe = styled.iframe<{ scale: number }>`
	border: none;
	display: block;
	position: absolute;
	left: 50%;
	transform: scale(${(p) => p.scale}) translateX(-50%);
	transform-origin: 0 0;
	background-color: #18181b;
	background-image: url('/charity_royale_logo.png');
	background-blend-mode: overlay;
	background-repeat: no-repeat;
	background-position: center;
	background-size: 35%;
`

const LiveEmoji = styled.span`
	font-size: ${(p) => p.theme.fontSize.s}px;
	margin-right: ${(p) => p.theme.space.xs}px;
`

export const GridCenterPanel = styled.div`
	grid-area: center-panel;
	aspect-ratio: 16/9;
`

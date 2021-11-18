import React, { useRef } from 'react'
import { useEffect } from 'react'
import { useGlobalState } from '../../hooks/useGlobalState'
import { useIsMounted } from '../../hooks/useIsMounted'
import { useSocket } from '../../hooks/useSocket'
import styled from 'styled-components'
import { ProjectFeedThePigGame } from './game/ProjectFeedThePigGame'

const PhaserDiv = styled.div`
	width: 100%;
	height: 100%;
`

export const PhaserGame = () => {
	const isMounted = useIsMounted()
	const { socket } = useSocket()
	const { globalState } = useGlobalState()
	const phaserContainerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (isMounted && socket && globalState) {
			new ProjectFeedThePigGame(socket, 1080, 1920, globalState)
		}

		// at this point we can be sure that globalState and socketIo connectin are given
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted])

	return <PhaserDiv id="pftp-overlay" ref={phaserContainerRef} />
}

export default PhaserGame

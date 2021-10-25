import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import styles from '/styles/Popup.module.css'

export default class AdvertiserSignUp extends React.Component {
    render() {
  	return (
		<div>
			<main className={styles.popup} onClick={this.props.close}>
				<div onClick={null}>
                    <h2>Advertisers</h2>
                    <div>
                        <button>Sign In</button>
                        <button>Sign Up</button>
                    </div>
                </div>				
			</main>
        </div>
	)}
}

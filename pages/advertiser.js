import Head from 'next/head'
import Link from 'next/link'
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Home.module.css'
import adsStyles from '../styles/Advertisers.module.css'
import adStyles from '../styles/Advertiser.module.css'
import mStyles from '../styles/Modal.module.css'
import { AuthErrorCodes, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React from 'react';
import { withRouter } from 'next/router'
import { firebaseApp, db } from '../firebase';
import { ref, child, get, set } from "firebase/database";
import { Modal } from 'react-bootstrap';
import { getStorage, ref as st_ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

class Advertiser extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user: null,
			campaigns: null,
			showSignInPopup: false,
			showNewCampaignPopup: false,
			errorMessage: "",
			leftImage: null,
			rightImage: null,
			tags: ['art', 'cooking', 'sales', 'electronics', 'movies', 'fashion', 'home', 'sports', 'outdoors', 'books', 'travel', 'music', 'pets', 'family'],
			newCampaignTags: ['rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)', 'rgb(240, 240, 240)'],
			regions: {
				"usa": false,
				"west": false,
				"midwest": false,
				"southwest": false,
				"southeast": false,
				"northeast": false,
				"coordinate": false
			}
		}

		console.log(props.router);
		const auth = getAuth();
		const user = auth.currentUser;
		if (user == null) {
			console.log("Please sign back in")
			this.state.showSignInPopup = true;
		} else {
			this.initUser(user);
		}

		this.initUser = this.initUser.bind(this);
		this.submitModal = this.submitModal.bind(this);
		this.setRegion = this.setRegion.bind(this);
	}

	initUser(user) {
		if (user.uid != null) {
			console.log("current user: " + user);

			const dbRef = ref(db);
			get(child(dbRef, `ads/${user.displayName}`)).then((snapshot) => {
			// get(child(dbRef, `ads/Apple`)).then((snapshot) => {
			if (snapshot.exists()) {
				this.setState({ user: user, campaigns: Object.keys(snapshot.val()).map((key) => [key, snapshot.val()[key]]).sort((a,b) => (a.created > b.created) ? 1 : ((b.created > a.created) ? -1 : 0)) });
				console.log(this.state.campaigns)
			} else {
				console.log("No data available");
			}
			}).catch((error) => {
				console.error(error);
			});

			// const displayName = user.displayName;
			// const email = user.email;
			// const photoURL = user.photoURL;
			// const emailVerified = user.emailVerified;
		}
	}

	submitModal() {
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		const auth = getAuth();
		signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Signed in 
			const user = userCredential.user;
			console.log(user.displayName);
			console.log(user.email);
			localStorage.setItem('name', user.displayName);
			localStorage.setItem('email', user.email);
			this.initUser(user);
			this.setState({ showSignInPopup: false });
			// this.props.router.push({pathname: '/advertiser', query: { id: userCredential.user.uid }});
		})
		.catch((error) => {
			if (error.code == "auth/invalid-email") {
				this.setState({ errorMessage: "Invalid email"});
				console.log("ERROR: " + error);
			} else if (error.code == "auth/wrong-password") {
				this.setState({ errorMessage: "Incorrect password"});
				console.log("ERROR: " + error);
			} else if (error.code == "auth/too-many-requests") {
				this.setState({ errorMessage: "Too many failed attempts, please try again later or reset your password"});
				console.log("ERROR: " + error);
			} else if (error.code == "auth/user-not-found") {
				this.setState({ errorMessage: "User not found"});
				console.log("ERROR: " + error);
			} else {
				this.setState({ errorMessage: "Unknown error, please try again"});
				console.log("ERROR: " + error);
			}
		});
	}

	selectNewTag(tag, i) {
		let tempTags = this.state.newCampaignTags;
		tempTags[i] = tempTags[i] == '#9DC3E6' ? 'rgb(240, 240, 240)' : '#9DC3E6';
		this.setState({ newCampaignTags: tempTags });
	}

	handleFileSelected(file, side) {
		if (side == "left") {
			this.setState({ leftImage: file});
		} else {
			this.setState({ rightImage: file});
		}
	}

	submitNewCampaign() {
		let campaignName = document.getElementById("campaign_name").value;
		let campaignLink = document.getElementById("campaign_link").value;
		var date = new Date();
		let campaignTags = [];
		let campaignRegion = [];
		for (let i in this.state.tags) {
			if (this.state.newCampaignTags[i] != 'rgb(240, 240, 240)') {
				campaignTags.push(this.state.tags[i])
			}
		}
		if (this.state.regions.usa) {
			campaignRegion = ["usa"];
		} else if (this.state.regions.coordinate) {
			campaignRegion.push(document.getElementById("campaign_region").value);
		} else {
			campaignRegion = [this.state.regions.west ? "west" : null, this.state.regions.midwest ? "midwest" : null, this.state.regions.southwest ? "southwest" : null, this.state.regions.souteast ? "southeast" : null, this.state.regions.northeast ? "northeast" : null]
		}
		if (campaignRegion == [] || campaignTags == [] || campaignName == "" || campaignLink == "") {
			alert("Please fill out all fields");
			return;
		}
		console.log(campaignName)
		console.log(campaignLink)
		console.log(campaignRegion)
		console.log(campaignTags)
		let storage = getStorage();
		const rightStorageRef = st_ref(storage, this.state.user.displayName + "_" + campaignName + "_right");
		const leftStorageRef = st_ref(storage, this.state.user.displayName + "_" + campaignName + "_left");
		uploadBytes(rightStorageRef, this.state.rightImage).then((snapshot) => {
			uploadBytes(leftStorageRef, this.state.leftImage).then((snapshot) => {
				console.log('Uploaded files');
				getDownloadURL(rightStorageRef).then((rightUrl) => {
					getDownloadURL(leftStorageRef).then((leftUrl) => {
						// `url` is the download URL for 'images/stars.jpg'
						console.log(rightUrl);
						console.log(leftUrl);

						set(ref(db, 'ads/' + this.state.user.displayName + '/' + campaignName), {
							clicks: 0,
							conversions: 0,
							created: date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " @ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
							link: campaignLink,
							region: campaignRegion,
							shares: 0,
							src: leftUrl,
							src_f: rightUrl,
							tags: campaignTags,
							views: 0
						}).then(() => {
							this.setState({ showNewCampaignPopup: false });
							this.initUser(this.state.user);
						});
					})
				})
			})
			.catch((error) => {
				console.log("UPLOAD FAILED: " + error);
			});
		});
	}

	deleteCampaign (campaignName) {
		let storage = getStorage();
		const rightStorageRef = st_ref(storage, this.state.user.displayName + "_" + campaignName + "_right");
		const leftStorageRef = st_ref(storage, this.state.user.displayName + "_" + campaignName + "_left");
		deleteObject(rightStorageRef).then((snapshot) => {
			deleteObject(leftStorageRef).then((snapshot) => {
				console.log('Deleted files');
				set(ref(db, 'ads/' + this.state.user.displayName + '/' + campaignName), null).then(() => {
					this.initUser(this.state.user);
				});
			})
			.catch((error) => {
				console.log("DELETE FAILED: " + error);
			});
		});
	}

	setRegion(val) {
		let temp = this.state.regions;
		if (val == "coordinate" && !temp[val]) {
			temp["usa"] = false;
			temp["west"] = false;
			temp["midwest"] = false;
			temp["southwest"] = false;
			temp["southeast"] = false;
			temp["northeast"] = false;
		} else if (val == "usa" && !temp[val]) {
			temp["west"] = false;
			temp["midwest"] = false;
			temp["southwest"] = false;
			temp["southeast"] = false;
			temp["northeast"] = false;
			temp["coordinate"] = false;
		} else if (val != "coordinate" && temp["coordinate"]) {
			temp["coordinate"] = false;
		} else if (val != "usa" && temp["usa"]) {
			temp["usa"] = false;
		}
		temp[val] = !temp[val];
		this.setState({ regions: temp });
	}

	render() {
  	return (
		<div>
			<Head>
				<title>Passive</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/icon.ico" />
			</Head>

			<main>
				<div className={adsStyles.header}>
					<Link href="/">
					    <h1>Passive</h1>
                    </Link>
				</div>

				{ this.state.user != null ?
				<div>
					<div style={{overflow: 'hidden', maxWidth: '1300px', margin: 'auto'}}>
						<div className={adStyles.header}>
							<h1><b>{this.state.user.displayName}</b></h1>
							<p>{this.state.user.email}</p>
							{/* <p>Verified: {this.state.user.emailVerified ? "yes" : "no"}</p> */}
						</div>
						<div className={adStyles.newCampaign}>
							<button onClick={() => this.setState({ showNewCampaignPopup: true })}>+ New Campaign</button>
							<a href="/passive_template.png" download>Download template</a>
						</div>
					</div>

					<div className={adStyles.active}>
						{this.state.campaigns != null ?
							<div>
							{this.state.campaigns.map((el, i) => {
								return(
									<div key={i} className={adStyles.campaign}>
										<div style={{overflow: 'hidden'	}}>
											<div className={adStyles.campaign_main}>
												<div className={adStyles.campaign_name}>
													<p className={adStyles.campaign_box_header}><b>Name:</b></p>
													<p className={adStyles.campaign_box_text}>{el[0]}</p>
												</div>
												<div className={adStyles.campaign_created}>
													<p className={adStyles.campaign_box_header}><b>Created:</b></p>
													<p className={adStyles.campaign_box_text}>{el[1].created.split(" @ ")[0]} <span id={adStyles.time}>{el[1].created.split(" @ ")[1]}</span></p>
												</div>
											</div>
											<div className={adStyles.campaign_stats}>
												<p className={adStyles.campaign_box_header}><b>Stats:</b></p>
												<p className={adStyles.campaign_box_text}>{el[1].views} views <span id={adStyles.clicks}>{el[1].clicks} clicks</span></p>
												<p className={adStyles.campaign_box_text}>{el[1].shares} shares <span id={adStyles.conversions}>{el[1].conversions} convert</span></p>
											</div>
											<div className={adStyles.campaign_tags}>
												<p className={adStyles.campaign_box_header}><b>Tags:</b></p>
												<div className={adStyles.campaign_box_text}>
													{this.state.tags.map((tag, i) => {
														return (
															<div key={i} className={adStyles.tag} style={{backgroundColor: el[1].tags.includes(tag) ? '#9DC3E6' : 'rgb(240, 240, 240)'}}>
																<p>{tag}</p>
															</div>
														)
													})}
												</div>
											</div>
											<div className={adStyles.campaign_region}>
												<p><b>Region: </b>{el[1].region.join(", ")}</p>
											</div>
											<div className={adStyles.campaign_link}>
												<p><b>Link: </b><a href={el[1].link} target="_blank" rel="noreferrer" style={{color: 'black'}}>{el[1].link}</a></p>
											</div>
											<div className={adStyles.campaign_delete}>
												<button onClick={() => this.deleteCampaign(el[0])}>Delete</button>
											</div>
										</div>
									</div>
								)
							})}
							</div>
							:
							<div style={{height: '60vh'}}>
								<p>no active campaigns found</p>
							</div>
						}

						
					</div>
				</div>
				:
				<div style={{height: 'calc(100vh - 200px)'}}>
					<p onClick={() => this.setState({ showSignInPopup: true })} style={{margin: '0 20px', textAlign: 'center', lineHeight: 'calc(100vh - 200px)'}}>For your safety, please sign back in</p>
				</div>
			}

				<div className={styles.footer}>
                    <p>Contact us at passiveapp@gmail.com</p>
				</div>
				
			</main>

			<Modal show={this.state.showSignInPopup} onHide={() => this.setState({ showSignInPopup: false })}>
				<Modal.Header closeButton style={{border: 'none'}}>
					<Modal.Title style={{fontSize: '20px', lineHeight: '1.2', fontWeight: 'bold'}}>Advertiser Sign In</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className={mStyles.body}>
						<p style={{width: '100%', textAlign: 'center'}}>For your safety, please sign back in</p>
						<div><p style={{color: 'red', textAlign: 'center', fontSize: '14px', marginTop: '20px', marginBottom: 0}}>{this.state.errorMessage}</p></div>
						<div className={mStyles.signin} id="signin">
							<input type="text" placeholder="Email" id="email" />
							<input type="password" placeholder="Password" id="password" />
						</div>
						<div className={mStyles.signin} id="modal_signup" style={{display: 'none'}}>
							<input type="text" placeholder="Company" id="company" />
							<input type="text" placeholder="Website (or other link)" id="link" />
						</div>
						<button onClick={this.submitModal}>Submit</button>
					</div>
				</Modal.Body>
			</Modal>

			<Modal show={this.state.showNewCampaignPopup} onHide={() => this.setState({ showNewCampaignPopup: false })}>
				<Modal.Header closeButton style={{border: 'none'}}>
					<Modal.Title style={{fontSize: '20px', lineHeight: '1.2', fontWeight: 'bold'}}>New Campaign</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className={mStyles.body}>
						<div><p style={{color: 'red', textAlign: 'center', fontSize: '14px', marginTop: '10px', marginBottom: 0}}>{this.state.errorMessage}</p></div>
						<div className={adStyles.newCampaignModal} id="signin">
							<input type="text" placeholder="Name" id="campaign_name" />
							<input type="text" placeholder="Link" id="campaign_link" />
							<p><b>Regions:</b></p>
							<div>
								<label className={styles.container}>USA
									<input type="checkbox" value="USA" checked={this.state.regions.usa} onChange={() => this.setRegion("usa")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>West
									<input type="checkbox" value="West" checked={this.state.regions.west} onChange={() => this.setRegion("west")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>Midwest
									<input type="checkbox" value="Midwest" checked={this.state.regions.midwest} onChange={() => this.setRegion("midwest")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>Southwest
									<input type="checkbox" value="Southwest" checked={this.state.regions.southwest} onChange={() => this.setRegion("southwest")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>Southeast
									<input type="checkbox" value="Southeast" checked={this.state.regions.southeast} onChange={() => this.setRegion("southeast")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>Northeast
									<input type="checkbox" value="Northeast" checked={this.state.regions.northeast} onChange={() => this.setRegion("northeast")} /><span className={styles.checkmark}></span>
								</label>
								<label className={styles.container}>Coordinate
									<input type="checkbox" value="Coordinate" checked={this.state.regions.coordinate} onChange={() => this.setRegion("coordinate")} /><span className={styles.checkmark}></span>
								</label>
							</div>
							{ this.state.regions.coordinate ?
								<input type="text" placeholder="Latitude, Longitude" id="campaign_region" />
							: null }
							<p><b>Tags:</b></p>
							<div>
								{this.state.tags.map((tag, i) => {
									return (
										<div key={i} className={adStyles.tag} onClick={() => this.selectNewTag(tag, i)} style={{backgroundColor: this.state.newCampaignTags[i]}}>
											<p>{tag}</p>
										</div>
									)
								})}
							</div>
							<p><b style={{ lineHeight: '40px' }}>Left image (.png):</b> <input type="file" name="left" accept="image/*" onChange={(e) => {this.handleFileSelected(e.target.files[0], 'left')}} /></p>
							<p><b style={{ lineHeight: '40px' }}>Right image (.png):</b> <input type="file" name="right" accept="image/*" onChange={(e) => {this.handleFileSelected(e.target.files[0], 'right')}} /></p>
						</div>
						<button onClick={() => this.submitNewCampaign()}>Submit</button>
					</div>
				</Modal.Body>
			</Modal>

        </div>
	)}
}

export default withRouter(Advertiser);

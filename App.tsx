import { useEffect, useState } from "react";
import { Dimensions, Image, StatusBar, Text, View } from "react-native";
import { Blurhash } from "react-native-blurhash";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const IMAGES = [
	['https://public.mssnapps.com/AIKi7quePbExkPjNm6RQjGiD0OjoqY6S.jpg', 'LfAwuYo*IToINlkFnyWUN1Rjoaoz'],
	['https://public.mssnapps.com/HGCFKIVZi9IkmmOjCTfFsgWERYR42iYA.jpg', 'LXE{U,xaIoR+~qt6RkWVJAWoj[jZ'],
	['https://public.mssnapps.com/eyx7p7F5O8NOsqhynRZx0eVaIBQF0RgK.webp', 'L8C$+05R02-V~CE2Sce?IwVt%0ba'],
	['https://public.mssnapps.com/HSsP1T6YDlaNDx6g2OoM7RLceThlUzga.jpg', 'LRH.Wr4TxGxb?dD*R%WAxvR:ogM{'],
	['https://public.mssnapps.com/3Wp0j0960GzrtW8bQQ5wPj7mHPt5Gpm4.jpg', 'L5PC{t0$0J3A01F{0M#79b$1uiyW'],
];

export default function App() {
	return (
		<GestureHandlerRootView style={{flex: 1}}>
			<Main/>
		</GestureHandlerRootView>
	);
}

function Main() {
	const width = Dimensions.get('window').width;
	const height = 300;

	const [position, setPosition] = useState(1);

	const offset = useSharedValue(0);
	const start = useSharedValue(0);

	const panGesture = Gesture.Pan().onUpdate(e => {
		const newOffset = e.translationX + start.value;

		if (-newOffset < 0 || -newOffset > width * (IMAGES.length - 1)) return;

		offset.value = newOffset;
	}).onEnd((e) => {
		const velocityX = e.velocityX;
		const index = offset.value / width;
		const startIndex = start.value / width;
		const diff = index - startIndex;

		const w = 0.3;
		const velLim = 1100;

		let newIndex = 0;

		if (Math.abs(diff) >= w) {
			if (diff > 0) {
				newIndex = startIndex + 1;
			} else {
				newIndex = startIndex - 1;
			}
		} else if (Math.abs(velocityX) >= velLim) {
			if (velocityX > 0) {
				newIndex = startIndex + 1;
			} else {
				newIndex = startIndex - 1
			}
		} else {
			newIndex = startIndex;
		}


		const newValue = Math.round(width * newIndex);
		if (-newIndex < 0 || -newIndex > (IMAGES.length - 1)) return; 
		offset.value = withTiming(newValue);
		start.value = newValue;
		runOnJS(setPosition)(Math.round(-newIndex + 1));
	});

	const animatedStyles = useAnimatedStyle(() => ({
		transform: [
			{translateX: offset.value}
		] as any
	}));

	return (
		<View style={{flex: 1, justifyContent: 'center', backgroundColor: 'white'}}>
			<StatusBar
				backgroundColor='white'
				barStyle='dark-content'
			/>
			<View style={{height: 24, backgroundColor: '#000000b0', width: 'auto', alignSelf: 'flex-end', margin: 5, borderRadius: 12, paddingHorizontal: 10}}>
				<Text style={{textAlign: 'center', marginRight: 5, fontSize: 14, color: 'white', alignSelf: 'center'}}>{position} / {IMAGES.length}</Text>
			</View>
			<GestureDetector gesture={panGesture}>
				<Animated.View style={[{flexDirection: 'row', width: width * IMAGES.length, height}, animatedStyles]}>
					{IMAGES.map(([img, hash], i) => (
						<ImageItem
							key={img}
							url={img}
							width={width}
							height={height}
							load={i <= position}
							hash={hash}
						/>
					))}
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

function ImageItem({url, width, height, load, hash} : ImageItemProps) {

	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!load || loaded) return;

		Image.prefetch(url).then(() => {
			console.log(`${url} loaded!`);
			setLoaded(true);
		})
	}, [load, loaded]);

	if (!loaded) return (

		<Blurhash
			blurhash={hash}
			style={{width, height}}
		/>

	);


	return (
		<Image
			source={{uri: url}}
			style={{width, height}}
			resizeMode="cover"
		/>
	);
}

interface ImageItemProps {
	url: string;
	width: number;
	height: number;
	load: boolean;
	hash: string;
}
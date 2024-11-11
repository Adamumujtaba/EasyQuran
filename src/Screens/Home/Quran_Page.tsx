/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ListRenderItem,
  ColorSchemeName,
  ViewToken,
  ViewabilityConfig,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckInternet from '../../components/CheckInternet';
import {Loader} from '../../components/Loader';
import {SpaceComponents} from '../../components/SpaceComponent';
import {useGetSurahQuery} from '../../quran-redux/quran-by-page';
import {BASE_URL} from '@env';

// Types
interface RouteParams {
  id: number;
  name: string;
  numberOfAyahs: number;
  englishName: string;
  englishNameTranslation: string;
}

interface NavigationProps {
  route: {params: RouteParams};
  navigation: any;
}

interface Verse {
  number: {
    inSurah: number;
  };
  text: {
    arab: string;
  };
  translation: {
    en: string;
  };
}

interface SelectedVerse {
  chapter: number;
  index: number;
}

// Constants
const STORAGE_KEY = 'index';
const DARK_COLOR = '#34170e';
const LIGHT_COLOR = '#fff';

// Utility Functions
const getTextColor = (colorScheme: ColorSchemeName): string =>
  colorScheme === 'dark' ? LIGHT_COLOR : DARK_COLOR;

const getBackgroundColor = (colorScheme: ColorSchemeName): string =>
  colorScheme === 'dark' ? '#000' : LIGHT_COLOR;

// Component for Last Read Section
const LastRead: React.FC<{selectedVerse: SelectedVerse | null}> = ({
  selectedVerse,
}) => {
  if (!selectedVerse) return null;

  return (
    <View style={styles.lastReadContainer}>
      <Text style={styles.lastReadText}>
        Last Read - Chapter: {selectedVerse.chapter}, Verse:{' '}
        {selectedVerse.index + 1}
      </Text>
    </View>
  );
};

// Main Component
const PageSurah: React.FC<NavigationProps> = ({route, navigation}) => {
  const {id, name, numberOfAyahs, englishName, englishNameTranslation} =
    route.params;
  const colorScheme = useColorScheme();
  const flatListRef = useRef<FlatList<Verse> | null>(null);

  const [showEng, setShowEng] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<SelectedVerse | null>(
    null,
  );
  const [visibleItems, setVisibleItems] = useState<ViewToken[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  const {data, isLoading, isFetching, refetch} = useGetSurahQuery({id});

  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      setVisibleItems(viewableItems);
    },
  ).current;

  // Handlers
  const toggleLanguage = useCallback(() => {
    // Save current scroll position
    if (flatListRef.current && visibleItems.length > 0) {
      const firstVisibleIndex = visibleItems[0].index ?? 0;
      setShowEng(prev => {
        // Use setTimeout to let the layout update before scrolling
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: firstVisibleIndex,
            animated: false,
            viewPosition: 0,
          });
        }, 0);
        return !prev;
      });
    } else {
      setShowEng(prev => !prev);
    }
  }, [visibleItems]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleShare = async (
    text: string,
    chapterNo: string,
    verseNo: string,
  ) => {
    const message = `Chapter: ${chapterNo}\nVerse: ${verseNo}\n${text}`;

    try {
      const result = await Share.share({message});
      if (result.action === Share.sharedAction) {
        console.log('Content shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVersePress = async (index: number, chapter: number) => {
    try {
      const newSelection = {index, chapter};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSelection));
      setSelectedVerse(newSelection);
    } catch (error) {
      console.error('Error saving index:', error);
    }
  };

  // Effects
  useEffect(() => {
    const loadSavedIndex = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          setSelectedVerse(JSON.parse(savedState));
        }
      } catch (error) {
        console.error('Failed to load navigation state:', error);
      }
    };

    loadSavedIndex();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colorScheme === 'dark' ? DARK_COLOR : LIGHT_COLOR,
      },
      headerTintColor: getTextColor(colorScheme),
      headerLeft: () => '',
      headerRight: () => (
        <HeaderRight
          numberOfAyahs={numberOfAyahs}
          englishName={englishName}
          englishNameTranslation={englishNameTranslation}
          name={name}
          showEng={showEng}
          colorScheme={colorScheme}
          onToggle={toggleLanguage}
        />
      ),
    });
  }, [
    navigation,
    numberOfAyahs,
    englishName,
    englishNameTranslation,
    name,
    showEng,
    colorScheme,
    toggleLanguage,
  ]);

  // Scroll position handling
  const handleScroll = useCallback((event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  }, []);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: showEng ? 150 : 100, // Adjust these values based on your actual item heights
      offset: (showEng ? 150 : 100) * index,
      index,
    }),
    [showEng],
  );

  const MemoizedVerse = React.memo(
    ({item, index}: {item: Verse; index: number}) => {
      const chapterNumber = data?.data?.number;
      const isSelected =
        chapterNumber === selectedVerse?.chapter &&
        index === selectedVerse?.index;

      return (
        <TouchableOpacity
          onPress={() => handleVersePress(index, chapterNumber)}
          style={[styles.card, isSelected && styles.selectedCard]}>
          <View style={styles.verseContainer}>
            <View style={styles.verseText}>
              <Text
                style={[styles.arabicText, {color: getTextColor(colorScheme)}]}>
                {item.text.arab}
              </Text>
              {showEng && (
                <Text
                  style={[
                    styles.englishText,
                    {color: getTextColor(colorScheme)},
                  ]}>
                  {item.translation.en}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() =>
                handleShare(
                  showEng ? item.translation.en : item.text.arab,
                  chapterNumber.toString(),
                  index.toString(),
                )
              }
              style={styles.verseNumber}>
              <Text style={styles.verseNumberText}>{item.number.inSurah}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
  );

  const renderVerse: ListRenderItem<Verse> = useCallback(
    ({item, index}) => {
      return <MemoizedVerse item={item} index={index} />;
    },
    [MemoizedVerse],
  );
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: getBackgroundColor(colorScheme)},
      ]}>
      <LastRead selectedVerse={selectedVerse} />
      <CheckInternet
        fetching={isFetching || isLoading}
        refetch={handleRefetch}
      />
      <FlatList
        ref={flatListRef}
        data={data?.data?.verses}
        renderItem={renderVerse}
        keyExtractor={useCallback(
          (item: Verse) => item.number.inSurah.toString(),
          [],
        )}
        ListFooterComponent={SpaceComponents}
        ListHeaderComponent={isLoading || isFetching ? Loader : SpaceComponents}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
};

// Header Right Component
interface HeaderRightProps {
  numberOfAyahs: number;
  englishName: string;
  englishNameTranslation: string;
  name: string;
  showEng: boolean;
  colorScheme: ColorSchemeName;
  onToggle: () => void;
}

const HeaderRight: React.FC<HeaderRightProps> = ({
  numberOfAyahs,
  englishName,
  englishNameTranslation,
  name,
  showEng,
  colorScheme,
  onToggle,
}) => (
  <View style={styles.headerRight}>
    <View>
      <Text style={[styles.headerText, {color: getTextColor(colorScheme)}]}>
        {numberOfAyahs} | {englishName}
      </Text>
      <Text style={[styles.headerSubtext, {color: getTextColor(colorScheme)}]}>
        {englishNameTranslation}
      </Text>
    </View>
    <View style={styles.headerNameContainer}>
      <Text style={[styles.headerName, {color: getTextColor(colorScheme)}]}>
        {name}
      </Text>
      <TouchableOpacity
        style={[
          styles.languageButton,
          {backgroundColor: colorScheme === 'dark' ? LIGHT_COLOR : DARK_COLOR},
        ]}
        onPress={onToggle}>
        <Text
          style={{color: colorScheme === 'light' ? LIGHT_COLOR : DARK_COLOR}}>
          {showEng ? 'AR' : 'ENG'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lastReadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: DARK_COLOR,
  },
  lastReadText: {
    color: LIGHT_COLOR,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '95%',
    gap: 20,
  },
  headerText: {
    fontSize: 14,
  },
  headerSubtext: {
    fontSize: 10,
  },
  headerNameContainer: {
    flexDirection: 'row',
  },
  headerName: {
    fontWeight: '600',
    fontSize: 20,
    marginHorizontal: 10,
  },
  languageButton: {
    padding: 5,
    width: 50,
    alignItems: 'center',
    borderRadius: 4,
    elevation: 3,
  },
  card: {
    marginVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: DARK_COLOR,
    width: '95%',
    marginHorizontal: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: '#8041303e',
  },
  verseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verseText: {
    width: '95%',
    marginTop: 20,
  },
  arabicText: {
    fontSize: 23,
  },
  englishText: {
    textAlign: 'left',
  },
  verseNumber: {
    backgroundColor: DARK_COLOR,
    minWidth: 22,
    minHeight: 22,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -5,
    left: -10,
    elevation: 4,
  },
  verseNumberText: {
    color: LIGHT_COLOR,
  },
});

export default PageSurah;

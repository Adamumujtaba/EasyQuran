/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Loader} from '../../components/Loader';
import {SpaceComponents} from '../../components/SpaceComponent';
import {useGetSurahListsQuery} from '../../quran-redux/quran-by-page';
import CheckInternet from '../../components/CheckInternet';

const QuranHomePage = ({navigation}: any) => {
  const {data, isLoading, isFetching, isError, refetch, error} =
    useGetSurahListsQuery();
  const colorScheme = useColorScheme();
  const TextColor = colorScheme === 'light' ? '#000' : '#fff';
  const [long, setLong] = useState(true);

  const toggleButton = useCallback(() => {
    setLong(!long);
  }, [long]);

  const buttonTitle = long ? 'SHORT' : 'LONG';

  const handleRefetch = useCallback(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, isFetching]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colorScheme === 'dark' ? '#34170e' : '#fff',
      },
      headerTintColor: TextColor,
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
          }}>
          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: colorScheme === 'dark' ? '#fff' : '#34170e'},
            ]}
            onPress={toggleButton}>
            <Text style={{color: colorScheme === 'light' ? '#fff' : '#34170e'}}>
              {buttonTitle}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [TextColor, buttonTitle, colorScheme, long, navigation, toggleButton]);

  function ListCard({item}: any) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('Surah', {
            id: item.number,
            name: item.name.long,
            englishName: item.name.translation.en,
            englishNameTranslation: item.name.transliteration.en,
            numberOfAyahs: item.numberOfVerses,
          });
        }}>
        <View style={{width: '10%'}}>
          <Text style={{color: TextColor}}>{item?.number}</Text>
        </View>
        <View
          style={{
            width: '70%',
            alignItems: 'flex-start',
          }}>
          <Text
            style={{
              color: TextColor,
              fontSize: 18,
            }}>
            {long ? item?.name?.long : item?.name?.short}
          </Text>
          <Text
            style={{
              marginTop: 7,
              color: TextColor,
            }}>
            {item?.name.transliteration.en}
          </Text>
        </View>
        <View style={{width: '20%'}}>
          <Text
            style={{
              fontSize: 12,
              color: TextColor,
            }}>
            {item?.name.translation.en}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,

          {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
        ]}>
        <Text style={{color: TextColor}}>
          Error loading data please retry: {error?.message ?? ''}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            {
              marginTop: 10,
              borderWidth: 1,
              borderColor: colorScheme === 'dark' ? '#fff' : '#34170e',
              padding: 10,
            },
          ]}
          onPress={handleRefetch}>
          <Text style={{color: TextColor}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: colorScheme === 'dark' ? '#000' : '#fff'},
      ]}>
      <>
        <CheckInternet
          fetching={isLoading || isFetching}
          refetch={handleRefetch}
        />
      </>
      <FlatList
        data={data?.data}
        showsVerticalScrollIndicator={false}
        renderItem={ListCard}
        ListFooterComponent={SpaceComponents}
        ListHeaderComponent={isLoading ? Loader : null}
      />
    </View>
  );
};

export default QuranHomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 5,
    width: 80,
    alignItems: 'center',
    borderRadius: 4,
    elevation: 3,
  },
  card: {
    marginHorizontal: 'auto',
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#34170e',
    width: '95%',
  },
});

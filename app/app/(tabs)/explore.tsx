import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { CustomHeader } from '../../src/components/CustomHeader';
import { CourseCard } from '../../src/components/CourseCard';
import { searchDeals } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';

// Basic debounce since we don't have lodash installed yet, let's implement simple one or install lodash
// Actually, let's just search on submit or use manual timeout for AAA feel
const useDebounce = (callback: any, delay: number) => {
    const [timer, setTimer] = useState<any>(null);
    return (...args: any[]) => {
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => callback(...args), delay));
    };
};

export default function ExploreScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const performSearch = async (text: string) => {
        if (!text.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        setSearched(true);
        const data = await searchDeals(text);
        setResults(data || []);
        setLoading(false);
    };

    const debouncedSearch = useCallback(useDebounce(performSearch, 500), []);

    const handleChange = (text: string) => {
        setQuery(text);
        debouncedSearch(text);
    };

    const categories = ['Python', 'React', 'Java', 'Design', 'Marketing', 'Business'];

    return (
        <View style={styles.container}>
            <CustomHeader title="Explore" />

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses (e.g., Python)..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={handleChange}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => handleChange('')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {!searched && !query && (
                <View style={styles.categories}>
                    <Text style={styles.sectionTitle}>Popular Categories</Text>
                    <View style={styles.tagsContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.tag}
                                onPress={() => handleChange(cat)}
                            >
                                <Text style={styles.tagText}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#111" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CourseCard deal={item} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        searched ? (
                            <Text style={styles.empty}>No results found for "{query}"</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#111',
        // Shadow
        shadowColor: '#111',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111',
        fontWeight: 'bold',
    },
    categories: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 12,
        color: '#111',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#FFF4CC',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#111',
    },
    tagText: {
        fontWeight: 'bold',
        color: '#111',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});

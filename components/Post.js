import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const POSTS_STORAGE_KEY = 'hiking_app_posts';

const Post = ({ onClose }) => {
  const [caption, setCaption] = useState('');
  const [mediaAttachments, setMediaAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAllComments, setShowAllComments] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentTab, setCurrentTab] = useState('create'); // 'create' or 'feed'

  // Load saved posts from storage on component mount
  useEffect(() => {
    loadSavedPosts();
  }, []);

  // Save posts to AsyncStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      savePosts();
    }
  }, [posts]);

  const loadSavedPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      if (savedPosts !== null) {
        const parsedPosts = JSON.parse(savedPosts);
        // Convert timestamp strings back to Date objects
        const postsWithDates = parsedPosts.map(post => ({
          ...post,
          timestamp: new Date(post.timestamp),
          comments: post.comments.map(comment => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          }))
        }));
        setPosts(postsWithDates);
      } else {
        // If no posts are saved yet, load a sample post
        const samplePosts = [
          {
            id: '1',
            user: 'John Hiker',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            caption: 'Beautiful day hiking at Mount Rainier! The views were incredible.',
            media: [{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', type: 'image' }],
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            likes: 12,
            comments: [
              { id: '101', user: 'Sarah', text: 'Looks amazing!', timestamp: new Date() },
              { id: '102', user: 'Mike', text: 'Great view!', timestamp: new Date() }
            ]
          }
        ];
        setPosts(samplePosts);
        await savePosts(samplePosts);
      }
    } catch (error) {
      console.error('Error loading posts from storage', error);
      Alert.alert('Error', 'Failed to load saved posts');
    }
  };

  const savePosts = async (postsToSave = posts) => {
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsToSave));
    } catch (error) {
      console.error('Error saving posts to storage', error);
      Alert.alert('Error', 'Failed to save your post');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaAttachments([...mediaAttachments, { 
        uri: result.assets[0].uri, 
        type: 'image' 
      }]);
    }
  };

  const pickVideo = async () => {
    // This would normally use expo-av for video
    alert('Video functionality requires expo-av package. Please install it first.');
  };

  const removeMedia = (index) => {
    const updatedAttachments = [...mediaAttachments];
    updatedAttachments.splice(index, 1);
    setMediaAttachments(updatedAttachments);
  };

  const handlePostSubmit = () => {
    if (!caption && mediaAttachments.length === 0) {
      Alert.alert('Empty Post', 'Please add a caption or media to your post');
      return;
    }

    // Create new post object
    const newPost = {
      id: Date.now().toString(),
      user: 'You', // In a real app, get the current user's name
      avatar: 'https://randomuser.me/api/portraits/women/43.jpg', // Replace with real user avatar
      caption: caption,
      media: [...mediaAttachments],
      timestamp: new Date(),
      likes: 0,
      comments: []
    };
    
    // Add to posts array
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    
    // Clear form after posting
    setCaption('');
    setMediaAttachments([]);
    
    // Switch to feed tab to show the new post
    setCurrentTab('feed');
    
    // Show success message
    Alert.alert('Success', 'Your post has been published and saved!');
  };

  const handleAddComment = (postId) => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        user: 'You',
        text: newComment,
        timestamp: new Date(),
      };
      
      // Update the comments for the specific post
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, comment]
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setNewComment('');
    }
  };

  const toggleLike = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.isLiked || false;
        return {
          ...post,
          isLiked: !isLiked,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
  };

  const deletePost = (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedPosts = posts.filter(post => post.id !== postId);
            setPosts(updatedPosts);
            Alert.alert("Success", "Post has been deleted");
          }
        }
      ]
    );
  };

  const renderMedia = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.mediaScrollView}
      >
        {mediaAttachments.map((media, index) => (
          <View key={index} style={styles.mediaContainer}>
            <Image source={{ uri: media.uri }} style={styles.media} />
            <TouchableOpacity 
              style={styles.removeMediaButton}
              onPress={() => removeMedia(index)}
            >
              <MaterialCommunityIcons name="close-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderPostMedia = (media) => {
    return (
      <ScrollView 
        horizontal 
        pagingEnabled
        showsHorizontalScrollIndicator={true}
        style={styles.postMediaScrollView}
      >
        {media.map((item, index) => (
          <View key={index} style={styles.postMediaContainer}>
            <Image source={{ uri: item.uri }} style={styles.postMedia} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
    );
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    // Convert milliseconds to minutes, hours, days
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderCreatePost = () => {
    return (
      <View style={styles.createPostSection}>
        <TextInput
          style={styles.captionInput}
          placeholder="What's on your hiking journey?"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        
        {mediaAttachments.length > 0 && renderMedia()}
        
        <View style={styles.attachmentButtons}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <MaterialCommunityIcons name="image" size={24} color="#FC5200" />
            <Text style={styles.attachButtonText}>Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.attachButton} onPress={pickVideo}>
            <MaterialCommunityIcons name="video" size={24} color="#FC5200" />
            <Text style={styles.attachButtonText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.postButton, (!caption && mediaAttachments.length === 0) && styles.disabledButton]}
            onPress={handlePostSubmit}
            disabled={!caption && mediaAttachments.length === 0}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFeed = () => {
    return (
      <View style={styles.feedContainer}>
        {posts.length === 0 ? (
          <View style={styles.emptyFeedContainer}>
            <MaterialCommunityIcons name="post-outline" size={64} color="#cccccc" />
            <Text style={styles.emptyFeedText}>No posts yet</Text>
            <Text style={styles.emptyFeedSubtext}>Create your first post to see it here!</Text>
          </View>
        ) : (
          posts.map(post => (
            <View key={post.id} style={styles.postItem}>
              <View style={styles.postHeader}>
                <Image 
                  source={{ uri: post.avatar }} 
                  style={styles.userAvatar} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{post.user}</Text>
                  <Text style={styles.postTime}>{formatTime(post.timestamp)}</Text>
                </View>
                {post.user === 'You' && (
                  <TouchableOpacity onPress={() => deletePost(post.id)}>
                    <MaterialCommunityIcons name="delete-outline" size={22} color="#757575" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.postCaption}>{post.caption}</Text>

              {post.media && post.media.length > 0 && renderPostMedia(post.media)}

              <View style={styles.interactionBar}>
                <TouchableOpacity 
                  style={styles.interactionButton} 
                  onPress={() => toggleLike(post.id)}
                >
                  <MaterialCommunityIcons 
                    name={post.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={post.isLiked ? "#FC5200" : "#757575"} 
                  />
                  <Text style={styles.interactionText}>{post.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.interactionButton}>
                  <MaterialCommunityIcons name="comment-outline" size={24} color="#757575" />
                  <Text style={styles.interactionText}>{post.comments.length}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.commentsSection}>
                {post.comments.length > 0 && (
                  <>
                    {post.comments.slice(0, 2).map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    ))}
                    
                    {post.comments.length > 2 && (
                      <TouchableOpacity>
                        <Text style={styles.viewAllComments}>
                          View all {post.comments.length} comments
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <View style={styles.addCommentSection}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity onPress={() => handleAddComment(post.id)}>
                    <MaterialCommunityIcons name="send" size={24} color="#FC5200" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentTab === 'create' ? 'Create Post' : 'Your Posts'}
        </Text>
        <View style={{width: 24}} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'create' && styles.activeTab]} 
          onPress={() => setCurrentTab('create')}
        >
          <Text style={[styles.tabText, currentTab === 'create' && styles.activeTabText]}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'feed' && styles.activeTab]} 
          onPress={() => setCurrentTab('feed')}
        >
          <Text style={[styles.tabText, currentTab === 'feed' && styles.activeTabText]}>
            Feed {posts.length > 0 && `(${posts.length})`}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {currentTab === 'create' ? renderCreatePost() : renderFeed()}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FC5200',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTabText: {
    color: '#FC5200',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  createPostSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  mediaScrollView: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mediaContainer: {
    position: 'relative',
    marginRight: 8,
  },
  media: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  attachButtonText: {
    marginLeft: 4,
    color: '#757575',
  },
  postButton: {
    backgroundColor: '#FC5200',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  feedContainer: {
    padding: 8,
  },
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyFeedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 16,
  },
  emptyFeedSubtext: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 8,
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#757575',
    fontSize: 12,
  },
  postCaption: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  postMediaScrollView: {
    marginBottom: 12,
  },
  postMediaContainer: {
    width: width - 64, // Account for post item padding
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  interactionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
    marginBottom: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  interactionText: {
    marginLeft: 4,
    color: '#757575',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  commentText: {
    flex: 1,
  },
  viewAllComments: {
    color: '#757575',
    marginBottom: 12,
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
});

export default Post;
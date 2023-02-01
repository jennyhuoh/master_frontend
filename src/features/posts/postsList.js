import { useGetPostsQuery } from "../api/apiSlice";

const PostCard = ({content}) => {
    return(
        <div key={content.id}>
            <div>{content.title}</div>
            <div>{content.body}</div>
        </div>
    )
}

export default function PostsList() {
    const {
        data: posts,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetPostsQuery()
    let postContent
    if(isLoading) {
        postContent = (
            <div>Loading...</div>
        )
    } else if (isSuccess) {
        postContent = posts.map((item) => {
            return <PostCard content={item} key={item.id} />
        })
    } else if (isError) {
        postContent = (
            <div>{error}</div>
        )
    }
    return <div>{postContent}</div>
}
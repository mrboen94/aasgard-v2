import ReactPlayer from 'react-player'

export interface IVideoProps {
  url: string
}

export default function Video(props: IVideoProps) {
  return (
    <div className="m-0 flex w-full items-center justify-center">
      <ReactPlayer controls={true} url={props.url} />
    </div>
  )
}

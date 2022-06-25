import cc from 'classcat'
import Button, { ButtonGroup } from 'components/Button'
import Dialog from 'components/Dialog'
import Checkbox from 'components/input/Checkbox'
import Slider from 'components/input/Slider'
import Meta from 'components/Meta'
import { range } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CornerLeftDown,
  CornerRightDown,
  Maximize2,
  Minimize2,
  Settings,
} from 'react-feather'
import { useFullscreen, useToggle } from 'react-use'
import styles from 'styles/pages/Reader.module.scss'
import useSWR from 'swr'
import fetcher from 'util/swr'

const Pages = ({ render }: { render: Array<string> }) => {
  const router = useRouter()
  const { id } = router.query
  // const { data, error, mutate } = useSWR(id ? `/api/book/${id}` : '', fetcher)

  return (
    <section>
      <div className={styles.canvas}>
        {render.map((v: string, i: number) => {
          return (
            <div className={styles.page} key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v} alt="" />
            </div>
          )
        })}
      </div>
    </section>
  )
}

const ReaderSettings = ({
  index,
  setIndex,
  invertControls,
  setInvertControls,
  invertPages,
  setInvertPages,
  pageAmount,
  setPageAmount,
}: {
  index: number
  setIndex(val: number): void
  invertControls: boolean
  setInvertControls(val: boolean): void
  invertPages: boolean
  setInvertPages(val: boolean): void
  pageAmount: number
  setPageAmount(val: number): void
}) => {
  return (
    <div>
      <Checkbox
        label="Invert Controls"
        name={'invert-controls'}
        id={'invert-controls'}
        value={invertControls}
        onChange={() => setInvertControls(!invertControls)}
      />
      <Checkbox
        label="Invert Pages"
        name={'invert-pages'}
        id={'invert-pages'}
        value={invertPages}
        onChange={() => setInvertPages(!invertPages)}
      />
      <Checkbox
        label="Dual Pages"
        name={'dual-pages'}
        id={'dual-pages'}
        value={pageAmount == 2}
        onChange={(event) => {
          setPageAmount((event.target as HTMLInputElement).checked ? 2 : 1)
          setIndex(
            (event.target as HTMLInputElement).checked ? index / 2 : index * 2
          )
        }}
      />
    </div>
  )
}

const Reader = () => {
  const router = useRouter()
  const { id } = router.query
  const { data, error } = useSWR(id ? `/api/book/${id}` : '', fetcher)

  // ref
  const fullscreenRef = useRef(null)

  // constants
  const [index, setIndex] = useState(0)
  const [pageAmount, setPageAmount] = useState(2)
  const [pageCount, setPageCount] = useState(0)
  const [controls, setControls] = useState(true)
  const [render, setRender] = useState<Array<string>>([])

  // hooks
  const [fullscreen, toggleFullscreen] = useToggle(false)
  const isFullscreen = useFullscreen(fullscreenRef, fullscreen, {
    onClose: () => toggleFullscreen(false),
  })

  // controls
  const [invertControls, setInvertControls] = useState(false)
  const [invertPages, setInvertPages] = useState(false)

  const readerSettingProps = {
    index: index,
    setIndex: setIndex,
    invertControls: invertControls,
    setInvertControls: setInvertControls,
    invertPages: invertPages,
    setInvertPages: setInvertPages,
    pageAmount: pageAmount,
    setPageAmount: setPageAmount,
  }

  const _prev = (pageNum: number) => {
    // dont allow to page out of bounds.
    if (pageNum - 1 < 0) return 0
    // add one to our page number to decrement.
    return pageNum - 1
  }
  const _next = (pageNum: number) => {
    // TODO dont allow to page out of bounds.
    if (pageNum - -1 < 0) return -1
    // add one to our page number to increment.
    return pageNum + 1
  }

  useEffect(() => {
    if (id === undefined) return setRender([])
    // TODO only render the front-cover.
    if (index === 0) return setRender([`/api/book/${id}/page/0`])
    if (index === 1) return setRender([`/api/book/${id}/page/1`])
    // TODO only render the back-cover.
    if (index === -1) return setRender([`/api/book/${id}/page/${-1}`])
    // loop all pages for our pageAmount range and render them
    let pages = range(index * pageAmount, index * pageAmount + pageAmount).map(
      (v: number) => `/api/book/${id}/page/${v}`
    )
    // reverse if inverted layout (manga).
    if (invertPages) pages = pages.reverse()
    // update the renderer.
    setRender(pages)
  }, [id, index, invertPages, pageAmount])

  useEffect(() => {
    if (!data) return
    setPageCount(data.count)
  }, [data])

  // TODO.
  // home - Return to index 0.
  // end - Return to index last.
  // f - fullscreen.
  // s - settings.
  // / - open keybind menu

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === ' ') setControls((controls) => !controls)
      if (event.key === 'm') setControls((controls) => !controls)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [])

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight')
        setIndex((pageNum) =>
          invertControls ? _prev(pageNum) : _next(pageNum)
        )
      if (event.key === 'ArrowLeft')
        setIndex((pageNum) =>
          invertControls ? _next(pageNum) : _prev(pageNum)
        )
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  }, [invertControls])

  return (
    <>
      {data && (
        <>
          <Meta title={`${data.data.Series.title} - ${data.data.title}`} />
          <div className={styles.root} ref={fullscreenRef}>
            <header
              className={cc([styles.header, { [styles.hidden]: !controls }])}
            >
              <div className={styles.wrapper}>
                <div className={styles.back}>
                  {data && (
                    <Button
                      onClick={() =>
                        router.push(`/series/${data.data.Series.id}`)
                      }
                    >
                      <ArrowLeft />
                    </Button>
                  )}
                </div>
                <div className={styles.title}>
                  {data.data &&
                    `${data.data.Series.title} - ${data.data.title}`}
                </div>
                <div className={styles.tools}>
                  <ButtonGroup>
                    <Button onClick={toggleFullscreen}>
                      {!isFullscreen ? <Maximize2 /> : <Minimize2 />}
                    </Button>
                    <Dialog
                      title={'Reader Settings'}
                      content={<ReaderSettings {...readerSettingProps} />}
                      ref={fullscreenRef.current || undefined}
                      onOpenChange={(open) =>
                        open === true && toggleFullscreen(false)
                      }
                    >
                      <Button>
                        <Settings />
                      </Button>
                    </Dialog>
                  </ButtonGroup>
                  {/* TODO Download Page */}
                </div>
              </div>
            </header>
            <Pages render={render} />
            <footer
              className={cc([styles.footer, { [styles.hidden]: !controls }])}
            >
              <div className={styles.wrapper}>
                <ButtonGroup>
                  <Button onClick={() => setIndex(0)}>
                    <CornerLeftDown />
                  </Button>
                  <Button onClick={() => setIndex((index) => _prev(index))}>
                    <ArrowLeft />
                  </Button>
                </ButtonGroup>
                <div className={styles.timeline}>
                  <Slider
                    value={index + 1}
                    onValueChange={(number) => setIndex(number[0])}
                  />
                </div>
                <ButtonGroup>
                  <Button onClick={() => setIndex((index) => _next(index))}>
                    <ArrowRight />
                  </Button>
                  <Button>
                    <CornerRightDown />
                  </Button>
                </ButtonGroup>
              </div>
            </footer>
          </div>
        </>
      )}
    </>
  )
}

export default Reader

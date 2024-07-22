import React, { useContext, useState } from 'react'
import { FaTrash } from 'react-icons/fa'

import Button from '../../components/Button/Button'

import { ElectronApiContext } from '../../context/ElectronApiContext'

import FormRow from '../../components/FormRow/FormRow'
import Input from '../../components/Input/Input'

import * as styles from './ResetApplication.module.scss'

const resetText = 'reset application'

/**
 * Renders a `ResetApplication` dialog.
 *
 * @example <caption>Render a ResetApplication dialog.</caption>
 *
 * return (
 *   <Dialog {...dialogProps}>
 *     <ResetApplication />
 *   </Dialog>
 * )
 */
const ResetApplication = () => {
  const { resetApplication } = useContext(ElectronApiContext)

  const [inputValue, setInputValue] = useState('')

  const onChangeResetApplication = (event) => {
    const { value } = event.target

    setInputValue(value)
  }

  const onClickReset = () => {
    resetApplication()
  }

  return (
    <div className={styles.content}>
      <p>
        Resetting the application will delete your download history, but any
        downloaded files will remain on your computer.
      </p>

      <FormRow
        description={`Please type "${resetText}" to enable the reset button.`}
      >
        <Input
          id="reset-application"
          label="Reset Application"
          type="text"
          onChange={onChangeResetApplication}
          onBlur={() => {}}
          value={inputValue}
        />
      </FormRow>

      <FormRow
        description="Earthdata Download will restart after resetting."
      >
        <Button
          onClick={onClickReset}
          variant="danger"
          Icon={FaTrash}
          size="lg"
          disabled={inputValue !== resetText}
        >
          Reset Application
        </Button>
      </FormRow>
    </div>
  )
}

export default ResetApplication

import os
import pandas as pd
import json

class DBHelper:

  def init(self):
    self.path_to_enrolled = os.path.join(os.path.dirname(__file__), "web","static","images","enrolled")
    self.set_path = '/images/enrolled/'
    self.prediction_folder_path = '/images/prediction/'
    self.mapper_csv_path = os.path.join(os.path.dirname(__file__), "data","mapper.csv")
    self.prediction_data_path = os.path.join(os.path.dirname(__file__), "data","recog.json")
    self.enrolled = []
    self.IMAGE_PATH_KEY = 'image_path'
    self.RECOG_PATH_KEY = 'recognised_image'
    self.MAPPED_IMAGE_KEY = 'mapped_image'
    self.DONE_KEY = 'done'
    self.mapper_columns = [self.IMAGE_PATH_KEY, self.RECOG_PATH_KEY, self.MAPPED_IMAGE_KEY, self.DONE_KEY ]

  def getEnrolled(self):
    self.init()
    for dir_name in sorted(os.listdir(self.path_to_enrolled )):
      set_path_dir = self.set_path+dir_name
      for file_name in sorted(os.listdir(os.path.join(self.path_to_enrolled ,dir_name))):
        self.enrolled.append(set_path_dir+'/'+file_name)
    return self.enrolled

  def getPredictionData(self):
    self.init()
    self.loadJsonToCSV()
    self.mapper_data = pd.read_csv(self.mapper_csv_path)
    prediction_data = []
    for image_path in self.prediction_data:
      prediction = {}
      prediction['image_path'] = self.correct_image_path(image_path['image_path'])
      prediction['recognised_images'] = []
      for indx, map_row in self.mapper_data.iterrows():
        if prediction['image_path'] == map_row[0]:
          prediction_image = {}
          prediction_image[self.RECOG_PATH_KEY] = map_row[1]
          prediction_image[self.MAPPED_IMAGE_KEY] = map_row[2]
          prediction['recognised_images'].append(prediction_image)
      prediction_data.append(prediction)
    
    return prediction_data

  def mapPrediction(self, data):
    self.init()
    self.mapper_data = pd.read_csv(self.mapper_csv_path)
    updated = False
    for indx, map_row in self.mapper_data.iterrows():
      
      if map_row[0] == data[self.IMAGE_PATH_KEY] and map_row[1] == data[self.RECOG_PATH_KEY]:
        maped_image = str(data[self.MAPPED_IMAGE_KEY])
        self.mapper_data.iat[indx, 2] = maped_image
        self.mapper_data.iat[indx, 3] = True
        self.write_data(self.mapper_data, True)
        updated = True
    return updated

  def write_data(self, df, overwrite=False):
    print('Writing Data To '+self.mapper_csv_path)
    # if file does not exist write header
    if not overwrite:
        if not os.path.isfile(self.mapper_csv_path):
            df.to_csv(r''+self.mapper_csv_path, index=None, header=True)
        else:  # else it exists so append without writing the header
            df.to_csv(self.mapper_csv_path, mode='a', index=None, header=False)
    else:
        df.to_csv(r'' + self.mapper_csv_path, index=None, header=True)

  def loadJsonToCSV(self):
    with open(self.prediction_data_path) as jsonData:
      self.prediction_data = json.load(jsonData)
      self.prediction_data = self.prediction_data['recognitions']
      
      jsonData.close()

    for prediction in self.prediction_data:
      for dir_name in prediction['recognised_ids']:
        set_path_dir = self.set_path + str(dir_name)
        for file_name in sorted(os.listdir(os.path.join(self.path_to_enrolled ,str(dir_name)))):
          file_path = set_path_dir+'/'+file_name
          out_data = pd.read_csv(self.mapper_csv_path)
          b = False
          for indx, scr_row in out_data.iterrows():
            if scr_row[0] == self.correct_image_path(prediction['image_path']) and scr_row[1] == file_path:
                b = True
                break
            else:
              b = False
          if not b:
            prediction_df = pd.DataFrame({
              self.IMAGE_PATH_KEY: [self.correct_image_path(prediction['image_path'])],
              self.RECOG_PATH_KEY: [file_path],
              self.MAPPED_IMAGE_KEY: ['TBD'],
              self.DONE_KEY: [False]
            }, columns=self.mapper_columns)
            self.write_data(prediction_df)
            print('Data Saved')

  def correct_image_path(self, image_path):
    parts = image_path.split('/')
    file_name = parts[len(parts)-1]
    corrected_path = self.prediction_folder_path + file_name
    return corrected_path